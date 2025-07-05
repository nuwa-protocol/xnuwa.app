import type { Message } from 'ai';
import { useCallback } from 'react';
import { type ChatSession, ChatStateStore } from '@/features/ai-chat/stores';

export const useChatSession = (sessionId: string) => {
  const store = ChatStateStore();

  const session = store.getSession(sessionId);

  const updateMessages = useCallback(
    (messages: Message[]) => {
      store.updateMessages(sessionId, messages);
    },
    [sessionId],
  );

  const updateSingleMessage = useCallback(
    (messageId: string, updates: Partial<Message>) => {
      const currentSession = store.getSession(sessionId);
      if (!currentSession) return;

      const updatedMessages = currentSession.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg,
      );

      const updatedSession: ChatSession = {
        ...currentSession,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };

      store.updateSession(sessionId, updatedSession);
    },
    [sessionId, store],
  );

  const deleteMessage = useCallback(
    (messageId: string) => {
      const currentSession = store.getSession(sessionId);
      if (!currentSession) return;

      const updatedMessages = currentSession.messages.filter(
        (msg) => msg.id !== messageId,
      );

      const updatedSession: ChatSession = {
        ...currentSession,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };

      store.updateSession(sessionId, updatedSession);
    },
    [sessionId, store],
  );

  const deleteMessagesAfterTimestamp = useCallback(
    (timestamp: number) => {
      const currentSession = store.getSession(sessionId);
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
    [sessionId, store],
  );

  const updateTitle = useCallback(async () => {
    await store.updateTitle(sessionId);
  }, [sessionId]);

  return {
    session,
    messages: store.getMessages(sessionId),
    updateMessages,
    updateSingleMessage,
    deleteMessage,
    deleteMessagesAfterTimestamp,
    updateTitle,
  };
};
