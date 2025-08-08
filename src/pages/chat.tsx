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
      {/* Subtle page-specific background enhancement */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-theme-subtle/20 to-theme-muted/10 pointer-events-none" />
      <div className="relative z-10 h-full">
        <Chat
          id={chatSession.id}
          initialMessages={initialMessages}
          isReadonly={false}
        />
      </div>
    </div>
  );
}
