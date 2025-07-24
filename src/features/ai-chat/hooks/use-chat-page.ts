'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createInitialChatSession } from '../stores';
import type { ChatSession } from '../types';
import { convertToUIMessage } from '../utils';
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
