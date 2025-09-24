import { BanknoteArrowDown, Sparkle } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { useChatTransactionInfo } from '../hooks/use-chat-transaction-info';
import type { PaymentTransaction, SortOption } from '../types';
import { filterAndSortChatRecords } from '../utils';
import { AITransactionDetailsModal } from './ai-transaction-details-modal';
import { AITransactionsFilter } from './ai-transaction-filter';
import { AITransactionItem } from './ai-transaction-item';
import { OrdersList } from './orders-list';

export function TransactionHistory() {
  const { chatRecords, error } = useChatTransactionInfo();
  const [selectedTransaction, setSelectedTransaction] =
    useState<PaymentTransaction | null>(null);
  const [openChats, setOpenChats] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>('time-desc');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'chat' | 'orders'>('chat');

  const toggleChat = (chatId: string) => {
    const newOpenChats = new Set<string>();
    if (!openChats.has(chatId)) {
      newOpenChats.add(chatId);
    }
    setOpenChats(newOpenChats);
  };

  const filteredAndSortedChatRecords = useMemo(() => {
    // Always sort transactions within each chat by time (earliest first)
    return filterAndSortChatRecords(chatRecords, filterDate, sortBy);
  }, [chatRecords, sortBy, filterDate]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error loading transactions: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Transactions</CardTitle>
          <AITransactionsFilter
            sortBy={sortBy}
            setSortBy={setSortBy}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
          />
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'chat' | 'orders')}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <Sparkle className="h-4 w-4" />
                AI Usage
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <BanknoteArrowDown className="h-4 w-4" />
                Deposits
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="chat"
              className="mt-6 max-h-[40vh] overflow-y-auto space-y-2"
            >
              {error ? (
                <p className="text-red-500">
                  Error loading transactions: {error}
                </p>
              ) : filteredAndSortedChatRecords.length === 0 ? (
                <p className="text-muted-foreground">
                  {filterDate
                    ? 'No transactions found for selected date'
                    : 'No transactions found'}
                </p>
              ) : (
                filteredAndSortedChatRecords.map((chatRecord) => (
                  <AITransactionItem
                    key={chatRecord.chatId}
                    chatRecord={chatRecord}
                    isOpen={openChats.has(chatRecord.chatId)}
                    onToggle={toggleChat}
                    onSelectTransaction={setSelectedTransaction}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <OrdersList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AITransactionDetailsModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </>
  );
}
