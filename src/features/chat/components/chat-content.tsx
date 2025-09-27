import { CapSelector } from '@/features/cap-store/components';
import { cn } from '@/shared/utils';
import { useChatContext } from '../contexts/chat-context';
import { ChatSessionsStore } from '../stores/chat-sessions-store';
import Header from './header';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';

export function ChatContent({
  isReadonly,
}: {
  isReadonly: boolean;
}) {
  const { chat } = useChatContext();
  const isNewChat = !(
    ChatSessionsStore().chatSessions[chat.id]?.messages.length > 0
  );

  if (isNewChat) return (
    <div
      className={cn(
        'flex flex-col mx-auto px-4 h-full justify-center bg-background pb-4 md:pb-6 gap-2 w-full max-w-4xl'
      )}
    >
      <div className="flex flex-row justify-center gap-2 mb-24">
        <CapSelector size="3xl" />
      </div>
      {!isReadonly && <MultimodalInput className={undefined} />}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <Header chatId={chat.id} />
      <Messages isReadonly={isReadonly} />
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
