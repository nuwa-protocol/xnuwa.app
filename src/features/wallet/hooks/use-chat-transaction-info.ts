import { useCallback, useEffect, useState } from 'react';
import { ChatSessionsStore } from '@/features/chat/stores';
import { fetchTransactionsFromChatSession } from '../service';
import type { ChatSessionTransactionRecords } from '../types';

export const useChatTransactionInfo = () => {
  const [chatRecords, setChatRecords] = useState<
    ChatSessionTransactionRecords[]
  >([]);

  const [error, setError] = useState<string | null>(null);

  const { getChatSessionsSortedByUpdatedAt } = ChatSessionsStore.getState();

  const fetchChatRecords = useCallback(async () => {
    try {
      const chatSessions = getChatSessionsSortedByUpdatedAt();

      const _chatRecords: ChatSessionTransactionRecords[] = [];
      // loop through all chat sessions
      for (const session of chatSessions) {
        const _chatRecord: ChatSessionTransactionRecords = {
          chatId: session.id,
          chatTitle: session.title,
          transactions: [],
        };

        const transactions = await fetchTransactionsFromChatSession(session);
        _chatRecord.transactions.push(...transactions);
        _chatRecords.push(_chatRecord);
      }

      setChatRecords(_chatRecords);

      return;
    } catch (error) {
      setError(error as string);
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchChatRecords();
  }, [fetchChatRecords]);

  return {
    chatRecords,
    error,
    refetch: fetchChatRecords,
  };
};
