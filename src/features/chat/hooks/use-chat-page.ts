import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCapStore } from '@/features/cap-store/hooks/use-cap-store';
import { useCurrentCap } from '@/shared/hooks/use-current-cap';
import { createInitialChatSession } from '../stores';
import type { ChatSession } from '../types';
import { convertToUIMessage } from '../utils';
import { useChatSessions } from './use-chat-sessions';

// Specialized hook for chat page logic
export const useChatPage = () => {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('cid');
  const capId = searchParams.get('capid');
  const { sessionsMap } = useChatSessions();
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setCurrentCap } = useCurrentCap();
  const { runCap } = useCapStore();

  useEffect(() => {
    const session = chatId ? sessionsMap[chatId] : null;
    const newChatSession =
      chatId && session ? session : createInitialChatSession();

    setChatSession(newChatSession);
    if (newChatSession.caps.length > 0) {
      setCurrentCap(newChatSession.caps[newChatSession.caps.length - 1]);
    }
    setIsLoading(false);
  }, [chatId, sessionsMap]);

  useEffect(() => {
    if (capId) {
      runCap(capId);
    }
  }, [capId]);

  return {
    chatSession,
    isLoading,
    chatId,
    initialMessages: chatSession
      ? chatSession.messages.map(convertToUIMessage)
      : [],
  };
};
