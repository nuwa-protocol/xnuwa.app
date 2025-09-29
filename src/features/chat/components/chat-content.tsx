import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { useChatContext } from '../contexts/chat-context';
import { ChatSessionsStore } from '../stores/chat-sessions-store';
import { CapInfo } from './cap-info';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';

export function ChatContent({ isReadonly }: { isReadonly: boolean }) {
  const { chat } = useChatContext();
  const isNewChat = !(
    ChatSessionsStore().chatSessions[chat.id]?.messages.length > 0
  );
  const { currentCap } = CurrentCapStore();

  return (
    <div className="flex flex-col h-full">
      {isNewChat ? (
        <div className="flex-1 flex items-center justify-center px-4">
          <CapInfo cap={currentCap} />
        </div>
      ) : (
        <Messages isReadonly={isReadonly} />
      )}
      <div
        className={
          'flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full max-w-4xl'
        }
      >
        {!isReadonly && <MultimodalInput className={undefined} />}
      </div>
    </div>
  );
}
