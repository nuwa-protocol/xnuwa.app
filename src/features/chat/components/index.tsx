import type { Attachment, UIMessage } from 'ai';
import { useState } from 'react';
import { ChatProvider, useChatContext } from '../contexts/chat-context';
import { CapUIRenderer } from './cap-ui-renderer';
import { CenteredWelcome } from './centered-welcome';
import Header from './header';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';

function ChatContent({ isReadonly }: { isReadonly: boolean }) {
  const { messages, chatId } = useChatContext();
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);

  const renderEmptyState = () => (
    <CenteredWelcome>
      <div className="w-full max-w-4xl space-y-6">
        <div className="px-4">
          <MultimodalInput
            attachments={attachments}
            setAttachments={setAttachments}
            className={undefined}
          />
        </div>
      </div>
    </CenteredWelcome>
  );

  return (
    <div className="flex flex-col relative min-w-0 h-screen bg-background">
      {/* Chat */}
      <div className={'flex flex-col w-full h-dvh bg-background'}>
        <Header chatId={chatId} />

        {messages.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <Messages isReadonly={isReadonly} />

            <form
              className={
                'flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-4xl'
              }
            >
              {!isReadonly && (
                <MultimodalInput
                  attachments={attachments}
                  setAttachments={setAttachments}
                  className={undefined}
                />
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export function Chat({
  id,
  initialMessages,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  isReadonly: boolean;
}) {
  const showArtifact = false;
  const artifactUrl = 'http://localhost:3000/note';
  return (
    <ChatProvider chatId={id} initialMessages={initialMessages}>
      <div className="flex flex-row h-dvh">
        <div className={showArtifact ? 'w-1/3' : 'flex-1'}>
          <ChatContent isReadonly={isReadonly} />
        </div>
        <div className={showArtifact ? "flex h-full w-2/3 p-4" : "w-0 h-0 border-none absolute"}>
          <div className="w-full h-full max-h-screen bg-gradient-to-br from-muted/20 to-background border border-border rounded-xl shadow-xl overflow-hidden">
            <CapUIRenderer
              srcUrl={artifactUrl}
              title="Artifact"
              artifact={true}
            />
          </div>
        </div>
      </div>
    </ChatProvider>
  );
}
