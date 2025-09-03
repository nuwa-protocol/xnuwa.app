import { Chat } from '@/features/chat/components';
import { ChatProvider } from '@/features/chat/contexts/chat-context';
import { useSearchParams } from 'react-router-dom';

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get('cid');
  
  return (
    <div className="h-full relative">
      <ChatProvider key={chatId || 'new'}>
        <Chat isReadonly={false} />
      </ChatProvider>
    </div>
  );
}
