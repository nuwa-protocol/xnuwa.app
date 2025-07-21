import { useCallback } from 'react';
import { generateTitleFromUserMessage } from '@/features/ai-chat/services';
import { type ChatSession, ChatStateStore } from '@/features/ai-chat/stores';

export const useUpdateChatTitle = (sessionId: string) => {
  const store = ChatStateStore();

  const updateTitle = useCallback(async () => {
    const session = store.readSession(sessionId);
    if (!session) return;

    const firstMessage = session.messages[0];

    if (!firstMessage) return;

    const title = await generateTitleFromUserMessage({ message: firstMessage });

    const updatedSession: ChatSession = {
      ...session,
      title: title,
    };

    store.updateSession(sessionId, updatedSession);
  }, [sessionId]);

  return {
    updateTitle,
  };
};
