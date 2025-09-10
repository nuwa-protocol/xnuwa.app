import { useChatContext } from '../contexts/chat-context';
import { ChatSessionsStore } from '../stores/chat-sessions-store';
import { Artifact } from './artifact';
import Header from './header';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';

export function ChatContent({ isReadonly }: { isReadonly: boolean }) {
    const { chat } = useChatContext();
    const { getChatSession } = ChatSessionsStore();
    const currentArtifact = getChatSession(chat.id)?.currentArtifact;

    return (
        <div className="flex flex-row h-dvh">
            <div className={currentArtifact ? 'w-1/3' : 'flex-1'}>
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
            </div>
            {currentArtifact && <Artifact artifactUrl={currentArtifact} />}
        </div>
    );
}
