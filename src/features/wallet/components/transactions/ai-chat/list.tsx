import { useMemo, useState } from 'react';
import { useAITransactions } from '@/features/wallet/hooks/use-ai-transactions';
import type {
    ChatSessionTransactionRecords,
    PaymentTransaction,
    SortOption,
} from '@/features/wallet/types';
import {
    AITransactionEmpty,
    AITransactionError,
    AITransactionSearchEmpty,
} from './abnormal';
import { AITransactionDetailsModal } from './details-modal';
import { AITransactionsFilter } from './filter';
import { AITransactionItem } from './item';
import { AITransactionSearch } from './search';

export function AITransactionList() {
    const { chatRecords, error, refetch } = useAITransactions();
    const [selectedTransaction, setSelectedTransaction] =
        useState<PaymentTransaction | null>(null);
    const [openChats, setOpenChats] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<SortOption>('time-desc');
    const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleChat = (chatId: string) => {
        const newOpenChats = new Set<string>();
        if (!openChats.has(chatId)) {
            newOpenChats.add(chatId);
        }
        setOpenChats(newOpenChats);
    };

    const finalChatRecords = useMemo(() => {
        return getProcessedChatRecords(chatRecords, filterDate, sortBy, searchTerm);
    }, [chatRecords, filterDate, sortBy, searchTerm]);

    if (error) return <AITransactionError onRetry={refetch} />;

    if (chatRecords.length === 0) return <AITransactionEmpty />;

    return (
        <div className="flex flex-col w-full">
            <div className="sticky top-0 z-20 flex flex-row items-center justify-between gap-3 pl-4 pr-1 py-2 bg-background">
                <AITransactionSearch
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
                <AITransactionsFilter
                    filterDate={filterDate}
                    sortBy={sortBy}
                    setFilterDate={setFilterDate}
                    setSortBy={setSortBy}
                />
            </div>
            {finalChatRecords.length === 0 ? (
                <AITransactionSearchEmpty
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filterDate={filterDate}
                    setFilterDate={setFilterDate}
                />
            ) : (
                finalChatRecords.map((chatRecord) => (
                    <AITransactionItem
                        key={chatRecord.chatId}
                        chatRecord={chatRecord}
                        isOpen={openChats.has(chatRecord.chatId)}
                        onToggle={toggleChat}
                        onSelectTransaction={setSelectedTransaction}
                    />
                ))
            )}
            <AITransactionDetailsModal
                transaction={selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
            />
        </div>
    );
}

export const getProcessedChatRecords = (
    chatRecords: ChatSessionTransactionRecords[],
    filterDate: Date | undefined,
    sortBy: SortOption,
    searchTerm?: string,
) => {
    // Always sort transactions within each chat by time (earliest first)
    const chatsWithSortedTransactions = chatRecords.map((chatRecord) => ({
        ...chatRecord,
        transactions: [...chatRecord.transactions].sort(
            (a, b) => a.info.timestamp - b.info.timestamp,
        ),
    }));

    let filtered = chatsWithSortedTransactions;

    // Filter by date if a date is selected - filter entire chats
    if (filterDate) {
        const filterDateStart = new Date(filterDate);
        filterDateStart.setHours(0, 0, 0, 0);
        const filterDateEnd = new Date(filterDate);
        filterDateEnd.setHours(23, 59, 59, 999);

        filtered = chatsWithSortedTransactions.filter((chatRecord) => {
            // Check if any transaction in the chat falls within the selected date
            return chatRecord.transactions.some((transaction) => {
                const transactionDate = new Date(transaction.info.timestamp);
                return (
                    transactionDate >= filterDateStart && transactionDate <= filterDateEnd
                );
            });
        });
    }

    // Apply text search on chat title + transactions
    const q = (searchTerm || '').trim().toLowerCase();
    if (q) {
        const matchesSearch = (record: ChatSessionTransactionRecords) => {
            if (record.chatTitle?.toLowerCase().includes(q)) return true;
            return record.transactions.some((tx) => {
                // Basic info fields
                if (tx.info?.message?.toLowerCase().includes(q)) return true;
                if (tx.info?.ctxId?.toLowerCase().includes(q)) return true;
                if (tx.info?.type?.toLowerCase().includes(q)) return true;

                const d = tx.details;
                if (!d) return false;

                const strFields: Array<unknown> = [
                    d.requirement?.resource,
                    d.requirement?.network,
                    d.requirement?.mimeType,
                    d.requirement?.asset,
                    d.requirement?.payTo,
                    d.requirement?.scheme,
                    String(d.requirement?.maxAmountRequired ?? ''),
                ];

                if (d.response) {
                    strFields.push(JSON.stringify(d.response));
                }

                if (strFields.some((v) => typeof v === 'string' && v.toLowerCase().includes(q))) {
                    return true;
                }

                return false;
            });
        };

        filtered = filtered.filter(matchesSearch);
    }

    // Sort chats based on selected criteria
    return filtered.sort((a, b) => {
        switch (sortBy) {
            case 'time-asc': {
                const oldestA = a.transactions[0]?.info.timestamp || 0;
                const oldestB = b.transactions[0]?.info.timestamp || 0;
                return oldestA - oldestB;
            }
            case 'time-desc': {
                const mostRecentA =
                    a.transactions[a.transactions.length - 1]?.info.timestamp || 0;
                const mostRecentB =
                    b.transactions[b.transactions.length - 1]?.info.timestamp || 0;
                return mostRecentB - mostRecentA;
            }
            case 'amount-asc': {
                const totalA = a.transactions.reduce((sum, t) => sum + Number(toPicoUsd(t.details)), 0);
                const totalB = b.transactions.reduce((sum, t) => sum + Number(toPicoUsd(t.details)), 0);
                return totalA - totalB;
            }
            case 'amount-desc': {
                const totalA = a.transactions.reduce((sum, t) => sum + Number(toPicoUsd(t.details)), 0);
                const totalB = b.transactions.reduce((sum, t) => sum + Number(toPicoUsd(t.details)), 0);
                return totalB - totalA;
            }
            default: {
                const mostRecentA =
                    a.transactions[a.transactions.length - 1]?.info.timestamp || 0;
                const mostRecentB =
                    b.transactions[b.transactions.length - 1]?.info.timestamp || 0;
                return mostRecentB - mostRecentA;
            }
        }
    });
};

const pow10 = (exp: number): bigint => {
    if (exp <= 0) return 1n;
    return 10n ** BigInt(exp);
};

const getAssetDecimals = (details: PaymentTransaction['details']) => {
    const dec = details?.requirement?.extra?.assetDecimals;
    return Number.isInteger(dec) ? Number(dec) : 6;
};

const toPicoUsd = (details: PaymentTransaction['details'] | null): bigint => {
    if (!details) return 0n;
    const raw = details?.requirement?.maxAmountRequired;
    if (raw === undefined || raw === null) return 0n;
    const amount = BigInt(String(raw));
    const decimals = getAssetDecimals(details);
    if (decimals === 12) return amount;
    if (decimals > 12) return amount / pow10(decimals - 12);
    return amount * pow10(12 - decimals);
};
