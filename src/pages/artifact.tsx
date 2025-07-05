'use client';

import { useChatPage } from '@/features/ai-chat/hooks/use-chat-page';
import { Artifact } from '@/features/documents/components/artifact';
import Loading from '@/shared/components/loading';

export default function ArtifactPage() {
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
