import { useChatContext } from '../contexts/chat-context';
import { ChatSessionsStore } from '../stores/chat-sessions-store';
import { Artifact } from './artifact';
import { ChatContent } from './chat-content';

export function Chat({ isReadonly }: { isReadonly: boolean }) {
  const { chat } = useChatContext();
  const { getChatSession } = ChatSessionsStore();
  const currentArtifact = getChatSession(chat.id)?.currentArtifact;

  return (
    <div className="flex flex-row h-dvh">
      <div className={currentArtifact ? 'w-1/3' : 'flex-1'}>
        <ChatContent isReadonly={isReadonly} />
      </div>
      {currentArtifact && <Artifact artifactUrl={currentArtifact} />}
    </div>
  );
}
