'use client';

import { Artifact } from '@/components/artifact';
import { useChatPage } from '@/hooks/use-chat-page';
import Loading from '../loading';

export default function Page() {
  const { chatSession, isLoading, initialMessages } = useChatPage();

  if (isLoading || !chatSession) {
    return <Loading />;
  }

  return (
    <Artifact
      chatId={chatSession.id}
      initialMessages={initialMessages}
      isReadonly={false}
    />
  );
}
