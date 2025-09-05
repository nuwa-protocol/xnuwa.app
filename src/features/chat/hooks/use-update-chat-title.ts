import { generateTitleFromUserMessage } from '../services';
import { ChatSessionsStore } from '../stores';
import { handleError } from '../utils';

export const useUpdateChatTitle = () => {
  const store = ChatSessionsStore();

  const updateTitle = async (chatId: string) => {
    const session = store.getChatSession(chatId);
    if (!session) return;

    const firstMessage = session.messages[0];

    if (!firstMessage) return;
    if (session.title !== 'New Chat') return;
    try {
      const title = await generateTitleFromUserMessage({
        chatId: chatId,
        message: firstMessage,
      });

      await store.updateSession(chatId, { title: title });
    } catch (error) {
      handleError(error as Error);
    }
  };

  return {
    updateTitle,
  };
};
