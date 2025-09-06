import { Chat } from '@/features/chat/components';
import { ChatProvider } from '@/features/chat/contexts/chat-context';

export default function ChatPage() {
  return (
    <div className="h-full relative">
      <ChatProvider>
        <Chat isReadonly={false} />
      </ChatProvider>
    </div>
  );
}
