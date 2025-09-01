import { memo, useEffect, useState } from 'react';
import { useChatContext } from '../contexts/chat-context';
import { Conversation, ConversationContent, ConversationScrollButton } from './conversation';
import { Loader } from './loader';
import { PreviewMessage } from './message';

interface MessagesProps {
  isReadonly: boolean;
}

function PureMessages({ isReadonly }: MessagesProps) {
  const { chatId, status, messages, setMessages, reload } = useChatContext();
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [userMessagesHeight, setUserMessagesHeight] = useState(0);

  useEffect(() => {
    if (status === 'submitted') {
      setHasSentMessage(true);
    }
  }, [status]);

  // when messages update, recalculate the height of the last user message
  useEffect(() => {
    const calculateLastUserMessageHeight = () => {
      // find the last user message DOM element
      const userMessages = document.querySelectorAll('[data-role="user"]');
      const lastUserMessage = userMessages[userMessages.length - 1];

      if (lastUserMessage) {
        const height = lastUserMessage.getBoundingClientRect().height;
        setUserMessagesHeight(height);
      } else {
        setUserMessagesHeight(0);
      }
    };

    // delay execution to ensure the DOM has been updated to ensure the user message get scrolled to the top
    const timer = setTimeout(calculateLastUserMessageHeight, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  // calculate the minimum height of the message
  const getMessageMinHeight = (shouldPushToTop: boolean, role: string) => {
    if (shouldPushToTop && role === 'assistant') {
      const headerHeight = 196;
      const calculatedMinHeight = Math.max(
        0,
        window.innerHeight - headerHeight - userMessagesHeight,
      );
      return calculatedMinHeight > 0 ? `${calculatedMinHeight}px` : undefined;
    }
    return undefined;
  };

  const getLoaderMinHeight = () => {
    const headerHeight = 196;
    const calculatedMinHeight = Math.max(0, window.innerHeight - headerHeight - userMessagesHeight);
    return `${calculatedMinHeight}px`;
  };

  return (
    <Conversation>
      <ConversationContent>
        {messages.map((message, index) => {
          const isStreaming =
            status === 'streaming' && messages.length - 1 === index;
          const isStreamingReasoning =
            isStreaming &&
            message.role === 'assistant' &&
            message.parts?.some((part) => part.type === 'reasoning') &&
            !message.parts?.some((part) => part.type === 'text');

          const shouldPushToTop = hasSentMessage && index === messages.length - 1;
          const minHeight = getMessageMinHeight(shouldPushToTop, message.role);

          return (
            <PreviewMessage
              key={message.id}
              chatId={chatId}
              message={message}
              isStreaming={isStreaming}
              isStreamingReasoning={isStreamingReasoning}
              setMessages={setMessages}
              reload={reload}
              isReadonly={isReadonly}
              minHeight={minHeight}
            />
          );
        })}

        {status === 'submitted' &&
          messages.length > 0 &&
          messages[messages.length - 1].role === 'user' && <Loader minHeight={getLoaderMinHeight()} />}
        <ConversationScrollButton />
      </ConversationContent>
    </Conversation>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isReadonly !== nextProps.isReadonly) return false;
  return true;
});
