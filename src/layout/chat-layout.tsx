import { Outlet } from 'react-router-dom';
import { ChatProvider } from '@/features/chat/contexts/chat-context';

export default function ChatLayout() {
  return (
    <ChatProvider>
      <Outlet />
    </ChatProvider>
  );
}
