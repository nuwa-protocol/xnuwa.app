import { useCallback } from 'react';
import { ChatStateStore } from '../stores';
import type { ChatSession } from '../types';

export const useChatSessions = () => {
  const store = ChatStateStore();

  const getSession = useCallback((id: string) => {
    return store.readSession(id);
  }, []);

  const deleteSession = useCallback((id: string) => {
    store.deleteSession(id);
  }, []);

  const updateSession = useCallback(
    (id: string, updates: Partial<Omit<ChatSession, 'id'>>) => {
      store.updateSession(id, updates);
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

  const deleteMessagesAfterTimestamp = useCallback(
    (sessionId: string, timestamp: number) => {
      const currentSession = store.readSession(sessionId);
      if (!currentSession) return;

      const updatedMessages = currentSession.messages.filter((msg) => {
        const messageTime = msg.createdAt
          ? new Date(msg.createdAt).getTime()
          : 0;
        return messageTime < timestamp;
      });

      const updatedSession: ChatSession = {
        ...currentSession,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };

      store.updateSession(sessionId, updatedSession);
    },
    [store],
  );

  return {
    sessions: getSortedSessions(),
    sessionsMap: store.sessions,
    getSession,
    deleteSession,
    updateSession,
    clearAllSessions,
    deleteMessagesAfterTimestamp,
  };
};
