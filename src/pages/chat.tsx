import { Chat } from '@/features/chat/components';
import { useChatPage } from '@/features/chat/hooks/use-chat-page';
import Loading from '@/shared/components/loading';

export default function ChatPage() {
  const { chatSession, isLoading, initialMessages } = useChatPage();

  if (isLoading || !chatSession) {
    return <Loading />;
  }

  return (
    <div className="h-full relative">
      <Chat
        id={chatSession.id}
        initialMessages={initialMessages}
        isReadonly={false}
      />
    </div>
  );
}
