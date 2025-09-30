import { useChat } from '@ai-sdk/react';
import { useChatContext } from '../contexts/chat-context';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from './conversation';
import { PreviewMessage } from './message';

interface MessagesProps {
  isReadonly: boolean;
}

function PureMessages({ isReadonly }: MessagesProps) {
  const { chat } = useChatContext();
  const { messages, status, setMessages, regenerate } = useChat({ chat });

  // Find the last clear context message index
  const lastClearContextIndex = messages.findLastIndex(
    (message) =>
      message.role === 'system' &&
      message.parts?.some(
        (part) => part.type === 'data-uimark' && part.data === 'clear-context',
      ),
  );

  // calculate the minimum height of the message
  const getMessageMinHeight = (shouldPushToTop: boolean) => {
    if (shouldPushToTop) {
      const headerHeight = 270;
      const calculatedMinHeight = Math.max(
        0,
        window.innerHeight - headerHeight,
      );
      return calculatedMinHeight > 0 ? `${calculatedMinHeight}px` : undefined;
    }
    return undefined;
  };



  return (
    <Conversation>
      <ConversationContent>
        {messages.map((message, index) => {
          // Messages before the last clear context should be muted
          const isBeforeLastClearContext =
            lastClearContextIndex !== -1 && index < lastClearContextIndex;


          const isStreaming = status === 'streaming' && messages.length - 1 === index;
          const isSubmitting = status === 'submitted' && messages.length - 1 === index;
          const isStreamingReasoning =
            isStreaming &&
            message.role === 'assistant' &&
            message.parts?.some((part) => part.type === 'reasoning') &&
            !message.parts?.some((part) => part.type === 'text');

          const shouldPushToTop =
            message.role === 'assistant' && index === messages.length - 1;
          const minHeight = getMessageMinHeight(shouldPushToTop);

          return (
            <div
              key={message.id}
              className={isBeforeLastClearContext ? 'opacity-50' : ''}
            >
              <PreviewMessage
                key={message.id}
                chatId={chat.id}
                message={message}
                isReadonly={isReadonly}
                minHeight={minHeight}
                isStreamingReasoning={isStreamingReasoning}
                isStreaming={isStreaming}
                setMessages={setMessages}
                regenerate={regenerate}
              />
            </div>
          );
        })}

        <ConversationScrollButton />
      </ConversationContent>
    </Conversation>
  );
}

export const Messages = PureMessages;
