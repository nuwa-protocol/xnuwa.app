import { useChatContext } from '../contexts/chat-context';
import Header from './header';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';

export function ChatContent({ isReadonly }: { isReadonly: boolean }) {
  const { chat } = useChatContext();

  return (
    <div className="flex flex-col relative min-w-0 h-full">
      <Header chatId={chat.id} />
      <Messages isReadonly={isReadonly} />
      <div
        className={
          'flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-4xl'
        }
      >
        {!isReadonly && <MultimodalInput className={undefined} />}
      </div>
    </div>
  );
}
