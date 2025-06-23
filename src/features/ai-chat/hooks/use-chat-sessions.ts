import { useCallback } from 'react';
import { ChatStateStore } from '@/stores/chat-store';
import type { ChatSession } from '@/stores/chat-store';

export const useChatSessions = () => {
  const store = ChatStateStore();

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

  return {
    sessions: getSortedSessions(),
    sessionsMap: store.sessions,
    deleteSession,
    updateSession,
    clearAllSessions,
  };
};
