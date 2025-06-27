'use client';

import type { Attachment, UIMessage } from 'ai';
import { useState } from 'react';

import { ArtifactViewer } from './artifact-viewer';
import { MultimodalInput } from '@/features/ai-chat/components';
import { Messages } from '@/features/ai-chat/components';

import { useCurrentDocument } from '@/features/documents/hooks/use-document-current';
import { useChatDefault } from '@/features/ai-chat/hooks/use-chat-default';
import { useArtifactWidth } from '@/layout/hooks/use-artifact-width';
import { useNavigate } from 'react-router-dom';

export function Artifact({
  chatId,
  initialMessages,
  isReadonly,
}: {
  chatId: string;
  initialMessages: Array<UIMessage>;
  isReadonly: boolean;
}) {
  const navigate = useNavigate();

  const handleOnResponse = (response: any) => {
    navigate(`/artifact?cid=${chatId}`);
  };

  const {
    messages,
    setMessages: setChatMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChatDefault(chatId, initialMessages, handleOnResponse);

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const { currentDocument } = useCurrentDocument();
  const isArtifact = currentDocument.documentId !== 'init';

  const artifactWidth = useArtifactWidth();

  if (!isArtifact) {
    return (
      <div className="flex size-full justify-center items-center">
        Todo: this is the all artifact page
      </div>
    );
  }

  return (
    <div className="flex flex-row h-dvh w-dvw fixed top-0 left-0 z-50 bg-transparent">
      {/* Artifact viewer */}

      <ArtifactViewer
        chatId={chatId}
        status={status}
        width={typeof artifactWidth === 'string' ? undefined : artifactWidth}
      />

      {/* Chat */}
      <div className="fixed bg-muted dark:bg-background h-dvh shrink-0 flex flex-col max-w-[400px] right-0 top-0 left-auto">
        <Messages
          chatId={chatId}
          status={status}
          messages={messages}
          setMessages={setChatMessages}
          reload={reload}
          isReadonly={isReadonly}
        />

        <form
          className={'flex flex-row gap-2 relative items-end w-full px-4 pb-4'}
        >
          {!isReadonly && (
            <MultimodalInput
              chatId={chatId}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              append={append}
              className="bg-background dark:bg-muted"
              setMessages={setChatMessages}
            />
          )}
        </form>
      </div>
    </div>
  );
}
