import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Sentry } from '@/shared/services/sentry';
import { generateUUID } from '@/shared/utils';
import { createClientAIFetch } from '../services';
import { useChatSessions } from './use-chat-sessions';
import { useUpdateChatTitle } from './use-update-chat-title';

export const useChatDefault = (
  chatId: string,
  initialMessages: UIMessage[],
) => {
  const navigate = useNavigate();
  const { updateTitle } = useUpdateChatTitle(chatId);
  const { addCurrentCapsToChat, getSession } = useChatSessions();
  const [searchParams] = useSearchParams();
  const chatIdFromParams = searchParams.get('cid');

  const handleUseChatError = (error: Error) => {
    toast.error('Chat Error', {
      description:
        error.message ||
        error.toString() ||
        'Unknown error, please try again later',
      action: {
        label: 'Retry',
        onClick: () => reload(),
      },
    });
    Sentry.captureException(error);
  };

  const handleOnResponse = () => {
    updateTitle();
    addCurrentCapsToChat(chatId);
    if (chatIdFromParams !== chatId) {
      navigate(`/chat?cid=${chatId}`);
    }
  };

  const handleOnFinish = () => {
    const chatSession = getSession(chatId);
    if (chatIdFromParams === chatId) return;
    if (chatSession) {
      toast.success(`Your chat "${chatSession.title}" is completed`, {
        action: {
          label: 'View Chat',
          onClick: () => navigate(`/chat?cid=${chatId}`),
        },
      });
    } else {
      toast.success(`Your chat is completed`, {
        action: {
          label: 'View Chat',
          onClick: () => navigate(`/chat?cid=${chatId}`),
        },
      });
    }
  };

  const {
    messages,
    setMessages: setChatMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChat({
    id: chatId,
    key: `chat-${chatId}`, // Force re-creation when chatId changes
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    fetch: createClientAIFetch(),
    experimental_prepareRequestBody: (body) => ({
      id: chatId,
      messages: body.messages,
    }),
    onError: handleUseChatError,
    onResponse: handleOnResponse,
    onFinish: handleOnFinish,
  });

  return {
    messages,
    setMessages: setChatMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  };
};
