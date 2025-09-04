import { useChat } from '@ai-sdk/react';
import { memo, useEffect, useState } from 'react';
import { useChatContext } from '../contexts/chat-context';
import { Conversation, ConversationContent, ConversationScrollButton } from './conversation';
import { Loader } from './loader';
import { PreviewMessage } from './message';

interface MessagesProps {
  isReadonly: boolean;
}

function PureMessages({ isReadonly }: MessagesProps) {
  const { chat } = useChatContext();
  const { messages, status, setMessages, regenerate } = useChat({ chat });
  const [userMessagesHeight, setUserMessagesHeight] = useState(0);

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

  const getLoaderMinHeight = () => {
    const headerHeight = 195;
    const calculatedMinHeight = Math.max(0, window.innerHeight - headerHeight - userMessagesHeight);
    return `${calculatedMinHeight}px`;
  };

  return (
    <Conversation>
      <ConversationContent>
        {messages.map((message, index) => {

          return (
            <PreviewMessage
              key={message.id}
              index={index}
              message={message}
              isReadonly={isReadonly}
              userMessagesHeight={userMessagesHeight}
            />
          );
        })}

        {/* Show loader from user message submission until AI outputs meaningful content */}
        {(() => {
          // Show loader during submission
          if (status === 'submitted' && messages.length > 0 && messages[messages.length - 1].role === 'user') {
            return true;
          }

          // Show loader during streaming if AI hasn't started outputting text/reasoning yet
          if (status === 'streaming' && messages.length >= 2) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant') {
              // Hide loader once AI starts outputting meaningful content
              const hasTextOrReasoning = lastMessage.parts?.some(part =>
                (part.type === 'text' && part.text?.trim()) || part.type === 'reasoning'
              );
              return !hasTextOrReasoning;
            }
          }

          return false;
        })() && <Loader minHeight={getLoaderMinHeight()} />}
        <ConversationScrollButton />
      </ConversationContent>
    </Conversation>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isReadonly !== nextProps.isReadonly) return false;
  return true;
});
