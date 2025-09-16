import { useChat } from '@ai-sdk/react';
import { useChatContext } from '../contexts/chat-context';
import { ChatContent } from './chat-content';
import { NewChat } from './new-chat';

export function Chat({ isReadonly }: { isReadonly: boolean }) {
  const { chat } = useChatContext();
  const { messages } = useChat({ chat });

  if (messages.length === 0) {
    return <NewChat />;
  }

  return <ChatContent isReadonly={isReadonly} />;
}
