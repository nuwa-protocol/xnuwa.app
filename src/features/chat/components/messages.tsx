import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import { useChatContext } from '../contexts/chat-context';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from './conversation';
import { Loader } from './loader';
import { PreviewMessage } from './message';

interface MessagesProps {
  isReadonly: boolean;
}

function PureMessages({ isReadonly }: MessagesProps) {
  const { chat, isChatLoading } = useChatContext();
  const { messages } = useChat({ chat });
  const [userMessagesHeight, setUserMessagesHeight] = useState(0);

  // Find the last clear context message index
  const lastClearContextIndex = messages.findLastIndex(
    (message) =>
      message.role === 'system' &&
      message.parts?.some(
        (part) => part.type === 'data-uimark' && part.data === 'clear-context',
      ),
  );

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
    const calculatedMinHeight = Math.max(
      0,
      window.innerHeight - headerHeight - userMessagesHeight,
    );
    return `${calculatedMinHeight}px`;
  };


  return (
    <Conversation>
      <ConversationContent>
        {messages.map((message, index) => {
          // Messages before the last clear context should be muted
          const isBeforeLastClearContext =
            lastClearContextIndex !== -1 && index < lastClearContextIndex;

          return (
            <div
              key={message.id}
              className={isBeforeLastClearContext ? 'opacity-50' : ''}
            >
              <PreviewMessage
                index={index}
                message={message}
                isReadonly={isReadonly}
                userMessagesHeight={userMessagesHeight}
              />
            </div>
          );
        })}

        {isChatLoading && <Loader minHeight={getLoaderMinHeight()} />}
        <ConversationScrollButton />
      </ConversationContent>
    </Conversation>
  );
}

export const Messages = PureMessages;
