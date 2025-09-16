import type { UIMessage } from 'ai';
import { ChatSessionsStore } from '../stores';

export const useDeleteMessagesAfterId = () => {
  const store = ChatSessionsStore();

  const deleteMessagesAfterId = async (
    chatId: string,
    messageId: string,
    lastMessage?: UIMessage,
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

  return {
    deleteMessagesAfterId,
  };
};
