import type { Message } from 'ai';
import { useCallback } from 'react';
import { ChatStateStore } from '../stores';
import type { ChatSession } from '../types';

export const useChatSessions = () => {
  const store = ChatStateStore();

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

    console.log('updatedMessages', updatedMessages);

    await store.updateSession(chatId, { messages: updatedMessages });
  };

  return {
    sessions: getSortedSessions(),
    sessionsMap: store.sessions,
    getSession,
    deleteSession,
    updateSession,
    clearAllSessions,
    deleteMessagesAfterId,
  };
};
