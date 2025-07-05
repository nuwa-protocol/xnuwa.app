'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  type ChatSession,
  createInitialChatSession,
} from '@/features/ai-chat/stores';
import { convertToUIMessage } from '@/features/ai-chat/utils';
import { useChatSessions } from './use-chat-sessions';

// Specialized hook for chat page logic
export const useChatPage = () => {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('cid');
  const { sessionsMap } = useChatSessions();
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = chatId ? sessionsMap[chatId] : null;
    const newChatSession =
      chatId && session ? session : createInitialChatSession();

    setChatSession(newChatSession);
    setIsLoading(false);
  }, [chatId, sessionsMap]);

  return {
    chatSession,
    isLoading,
    chatId,
    initialMessages: chatSession
      ? chatSession.messages.map(convertToUIMessage)
      : [],
  };
};
