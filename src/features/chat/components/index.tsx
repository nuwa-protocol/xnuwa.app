import { useChat } from '@ai-sdk/react';
import { useChatContext } from '../contexts/chat-context';
import { CenteredWelcome } from './centered-welcome';
import Header from './header';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';

function ChatContent({ isReadonly }: { isReadonly: boolean }) {
  const { chat, chatId } = useChatContext();
  const { messages } = useChat({ chat });

  const renderEmptyState = () => (
    <CenteredWelcome>
      <div className="w-full max-w-4xl space-y-6">
        <div className="px-4">
          <MultimodalInput />
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
              {!isReadonly && <MultimodalInput className={undefined} />}
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export function Chat({ isReadonly }: { isReadonly: boolean }) {
  const showArtifact = false;
  const artifactUrl = 'http://localhost:3000/note';

  return (
    <div className="flex flex-row h-dvh">
      <div className={showArtifact ? 'w-1/3' : 'flex-1'}>
        <ChatContent isReadonly={isReadonly} />
      </div>
      {/* TODO: debug artifact */}
      {/* <div className={showArtifact ? "flex h-full w-2/3 p-4" : "w-0 h-0 border-none absolute"}>
        <div className="w-full h-full max-h-screen bg-gradient-to-br from-muted/20 to-background border border-border rounded-xl shadow-xl overflow-hidden">
          <CapUIRenderer
            srcUrl={artifactUrl}
            title="Artifact"
            artifact={true}
          />
        </div>
      </div> */}
    </div>
  );
}
