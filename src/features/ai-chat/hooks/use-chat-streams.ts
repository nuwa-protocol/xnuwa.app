// use-chat.ts (重构版本)
// Enhanced hooks that use services for business logic
'use client';

import { useCallback } from 'react';
import { ChatStateStore } from '@/stores/chat-store';

export const useChatStreams = () => {
  const store = ChatStateStore();

  const createStreamId = useCallback(
    async (streamId: string, chatId: string) => {
      await store.createStreamId(streamId, chatId);
    },
    [],
  );

  const getStreamIdsByChatId = useCallback(async (chatId: string) => {
    return await store.getStreamIdsByChatId(chatId);
  }, []);

  return {
    createStreamId,
    getStreamIdsByChatId,
  };
};
