import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { useNavigate } from 'react-router-dom';
import { generateUUID } from '@/shared/utils';
import { ChatSDKError } from '../errors/chatsdk-errors';
import { ErrorHandlers } from '../errors/error-handler';
import { createClientAIFetch } from '../services';
import { useChatSessions } from './use-chat-sessions';
import { useUpdateChatTitle } from './use-update-chat-title';

export const useChatDefault = (
  chatId: string,
  initialMessages: UIMessage[],
) => {
  const navigate = useNavigate();
  const { updateTitle } = useUpdateChatTitle(chatId);
  const { addCurrentCapsToChat } = useChatSessions();
  const handleUseChatError = (error: Error) => {
    let errorMessage: UIMessage;
    if (error instanceof ChatSDKError) {
      errorMessage = ErrorHandlers.api(error.message);
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = ErrorHandlers.network(
        'Failed to connect to the AI service',
      );
    } else if (error.message.includes('timeout')) {
      errorMessage = ErrorHandlers.timeout('AI response');
    } else {
      errorMessage = ErrorHandlers.generic(error.message);
    }
    // Add error message to chat
    setChatMessages((messages) => [...messages, errorMessage]);
  };

  const handleOnResponse = () => {
    updateTitle();
    addCurrentCapsToChat(chatId);
    navigate(`/chat?cid=${chatId}`);
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
