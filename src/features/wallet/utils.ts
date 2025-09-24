import { formatAmount } from '@nuwa-ai/payment-kit';
import type { ChatSessionTransactionRecords, SortOption } from './types';

export const formatUsdCost = (cost: bigint | undefined) => {
  if (!cost) return undefined;
  if (typeof cost === 'bigint') return `$${formatAmount(cost, 12)}`;
  if (cost !== undefined && cost !== null) {
    return `$${formatAmount(BigInt(String(cost)), 12)}`;
  }
  return undefined;
};

export const filterAndSortChatRecords = (
  chatRecords: ChatSessionTransactionRecords[],
  filterDate: Date | undefined,
  sortBy: SortOption,
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
        const totalA = a.transactions.reduce(
          (sum, t) => sum + Number(t.details?.payment?.costUsd || 0),
          0,
        );
        const totalB = b.transactions.reduce(
          (sum, t) => sum + Number(t.details?.payment?.costUsd || 0),
          0,
        );
        return totalA - totalB;
      }
      case 'amount-desc': {
        const totalA = a.transactions.reduce(
          (sum, t) => sum + Number(t.details?.payment?.costUsd || 0),
          0,
        );
        const totalB = b.transactions.reduce(
          (sum, t) => sum + Number(t.details?.payment?.costUsd || 0),
          0,
        );
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
