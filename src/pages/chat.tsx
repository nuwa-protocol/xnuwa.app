import { Chat } from '@/features/chat/components';
import { ChatProvider } from '@/features/chat/contexts/chat-context';

export default function ChatPage() {
  return (
    <ChatProvider>
      <Chat isReadonly={false} />
    </ChatProvider>
  );
}
