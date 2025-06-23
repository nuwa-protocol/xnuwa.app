'use client';

import { Chat } from '@/components/chat';
import { useChatPage } from '@/hooks/use-chat-page';
import Loading from '../loading';

export default function Page() {
  const { chatSession, isLoading, initialMessages } = useChatPage();

  if (isLoading || !chatSession) {
    return <Loading />;
  }

  return (
    <Chat
      id={chatSession.id}
      initialMessages={initialMessages}
      isReadonly={false}
    />
  );
}
