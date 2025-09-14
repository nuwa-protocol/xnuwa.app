import { useChat } from '@ai-sdk/react';
import { useCallback } from 'react';
import { CapUIRenderer } from '@/shared/components/cap-ui-renderer';
import { generateUUID } from '@/shared/utils';
import { useChatContext } from '../../chat/contexts/chat-context';
import { ChatSessionsStore } from '../../chat/stores/chat-sessions-store';
import { useArtifactsStore } from '../stores';
import { ArtifactHeader } from './artifact-header';

type ArtifactProps = {
    artifactId: string;
};

export const Artifact = ({ artifactId }: ArtifactProps) => {
    const { addSelectionToChatSession } = ChatSessionsStore();
    const { chat } = useChatContext();
    const { sendMessage } = useChat({ chat });
    const { getArtifact, updateArtifact } = useArtifactsStore();

    const handleSendPrompt = useCallback(
        (prompt: string) => {
            sendMessage({ text: prompt });
        },
        [sendMessage],
    );

    const handleAddSelection = useCallback(
        (label: string, message: string) => {
            addSelectionToChatSession(chat.id, {
                id: generateUUID(),
                label,
                message,
            });
        },
        [chat, addSelectionToChatSession],
    );

    // Save state to store instead of localStorage
    const handleSaveState = useCallback(
        (state: any) => {
            updateArtifact(artifactId, { state });
        },
        [artifactId, updateArtifact],
    );

    // Get state from store instead of localStorage
    const handleGetState = useCallback(
        () => {
            const currentArtifact = getArtifact(artifactId);
            return currentArtifact?.state || null;
        },
        [artifactId, getArtifact],
    );
    
    // Get artifact from store
    const artifact = getArtifact(artifactId);
    
    if (!artifact) {
        return <div>Artifact not found</div>;
    }
    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            {/* Header */}
            <ArtifactHeader title={artifact.title} />
            <div className="min-h-0 flex-1 overflow-hidden">
                <CapUIRenderer
                    srcUrl={artifact.source.url}
                    title={artifact.title}
                    artifact={true}
                    onSendPrompt={handleSendPrompt}
                    onAddSelection={handleAddSelection}
                    onSaveState={handleSaveState}
                    onGetState={handleGetState}
                />
            </div>
        </div>
    );
};
