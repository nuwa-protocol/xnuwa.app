import { useChat } from '@ai-sdk/react';
import { CapUIRenderer } from '@/shared/components/cap-ui-renderer';
import { useChatContext } from '../../chat/contexts/chat-context';
import { ChatSessionsStore } from '../../chat/stores/chat-sessions-store';
import { ArtifactHeader } from './artifact-header';

type ArtifactProps = {
    artifactUrl: string;
    title?: string;
};

export const Artifact = ({
    artifactUrl,
    title = 'Untitled Artifact',
}: ArtifactProps) => {
    const { addSelectionToChatSession } = ChatSessionsStore();
    const { chat } = useChatContext();
    const { sendMessage } = useChat({ chat });

    const handleSendPrompt = (prompt: string) => {
        sendMessage({ text: prompt });
    };

    const handleAddSelection = (label: string, message: string) => {
        addSelectionToChatSession(chat.id, { label, message });
    };

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            {/* Header */}
            <ArtifactHeader title={title} />
            <div className="min-h-0 flex-1 overflow-hidden">
                <CapUIRenderer
                    srcUrl={artifactUrl}
                    title={title}
                    artifact={true}
                    onSendPrompt={handleSendPrompt}
                    onAddSelection={handleAddSelection}
                    onSaveState={() => { }}
                    onGetState={() => { }}
                />
            </div>
        </div>
    );
};
