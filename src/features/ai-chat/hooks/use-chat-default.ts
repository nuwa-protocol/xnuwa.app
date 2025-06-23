import type { UIMessage } from 'ai';
import { ErrorHandlers } from '@/errors/error-handler';
import { useChat } from '@ai-sdk/react';
import { generateUUID } from '@/utils';
import { createClientAIFetch } from '@/lib/ai';
import { ChatSDKError } from '@/errors/chatsdk-errors';

export const useChatDefault = (
  chatId: string,
  initialMessages: UIMessage[],
) => {
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
      lastMessage: body.messages.at(-1),
    }),
    onError: handleUseChatError,
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
