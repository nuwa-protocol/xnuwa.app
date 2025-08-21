import type { Message } from 'ai';
import { useCallback } from 'react';
import { useCurrentCap } from '@/shared/hooks/use-current-cap';
import { ChatStateStore } from '../stores';
import type { ChatSession } from '../types';

export const useChatSessions = () => {
  const store = ChatStateStore();
  const { currentCap } = useCurrentCap();

  const getSession = useCallback((id: string) => {
    return store.getChatSession(id);
  }, []);

  const deleteSession = useCallback((id: string) => {
    store.deleteSession(id);
  }, []);

  const updateSession = useCallback(
    async (id: string, updates: Partial<Omit<ChatSession, 'id'>>) => {
      await store.updateSession(id, updates);
    },
    [],
  );

  const clearAllSessions = useCallback(() => {
    store.clearAllSessions();
  }, []);

  const getSortedSessions = useCallback(() => {
    return Object.values(store.sessions).sort(
      (a, b) => b.updatedAt - a.updatedAt,
    );
  }, [store.sessions]);

  const deleteMessagesAfterId = async (
    chatId: string,
    messageId: string,
    lastMessage?: Message,
  ) => {
    const currentSession = store.getChatSession(chatId);
    if (!currentSession) return;

    const messageIndex = currentSession.messages.findIndex(
      (msg) => msg.id === messageId,
    );
    if (messageIndex === -1) return;

    const updatedMessages = lastMessage
      ? [...currentSession.messages.slice(0, messageIndex), lastMessage]
      : currentSession.messages.slice(0, messageIndex + 1);

    await store.updateSession(chatId, { messages: updatedMessages });
  };

  const addCurrentCapsToChat = async (chatId: string) => {
    const currentSession = store.getChatSession(chatId);
    if (!currentSession) return;
    if (!currentCap) return;

    if (currentSession.caps.some((c) => c.id === currentCap.id)) return;

    await store.updateSession(chatId, {
      caps: [...currentSession.caps, currentCap],
    });
  };

  return {
    sessions: getSortedSessions(),
    sessionsMap: store.sessions,
    getSession,
    deleteSession,
    updateSession,
    clearAllSessions,
    deleteMessagesAfterId,
    addCurrentCapsToChat,
  };
};
