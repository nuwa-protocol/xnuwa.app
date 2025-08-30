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
  useEffect(() => {
    if (status === 'submitted') {
      setHasSentMessage(true);
    }
  }, [status]);

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
              requiresScrollPadding={
                hasSentMessage && index === messages.length - 1
              }
            />
          );
        })}

        {status === 'submitted' &&
          messages.length > 0 &&
          messages[messages.length - 1].role === 'user' && <Loader />}
        <ConversationScrollButton />
      </ConversationContent>
    </Conversation>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isReadonly !== nextProps.isReadonly) return false;
  return true;
});
