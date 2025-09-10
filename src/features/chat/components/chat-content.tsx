import { useChat } from '@ai-sdk/react';
import { useChatContext } from '../contexts/chat-context';
import Header from './header';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';
import { NewChat } from './new-chat';

export function ChatContent({ isReadonly }: { isReadonly: boolean }) {
    const { chat } = useChatContext();
    const { messages } = useChat({ chat });

    if (messages.length === 0) {
        return <NewChat />;
    }

    return (
        <div className="flex flex-col relative min-w-0 h-screen bg-background">
            {/* Chat */}
            <div className="flex flex-col w-full h-dvh bg-background">
                <Header chatId={chat.id} />

                <Messages isReadonly={isReadonly} />

                <form
                    className={
                        'flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-4xl'
                    }
                >
                    {!isReadonly && <MultimodalInput className={undefined} />}
                </form>
            </div>
        </div>
    );
}
