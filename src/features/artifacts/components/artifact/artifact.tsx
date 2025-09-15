import { useChat } from '@ai-sdk/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useChatContext } from '@/features/chat/contexts/chat-context';
import { ChatSessionsStore } from '@/features/chat/stores/chat-sessions-store';
import { CapUIRenderer } from '@/shared/components/cap-ui-renderer';
import { CurrentArtifactMCPToolsStore } from '@/shared/stores/current-artifact-store';
import { generateUUID } from '@/shared/utils';
import { useArtifactsStore } from '../../stores';
import { ArtifactHeader } from './artifact-header';

type ArtifactProps = {
    artifactId: string;
};

export const Artifact = ({ artifactId }: ArtifactProps) => {
    const { addSelectionToChatSession } = ChatSessionsStore();
    const { chat } = useChatContext();
    const { sendMessage, status } = useChat({ chat });
    const { getArtifact, updateArtifact } = useArtifactsStore();
    const { setTools, clearTools } = CurrentArtifactMCPToolsStore();
    const [connectionError, setConnectionError] = useState<boolean>(false);

    const handleSendPrompt = useCallback(
        (prompt: string) => {
            if (status === 'streaming' || status === 'submitted') {
                toast.warning(
                    'Waiting for the model to finish processing the previous message...',
                );
                return;
            }
            sendMessage({ text: prompt });
        },
        [sendMessage, status],
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
    const handleGetState = useCallback(() => {
        const currentArtifact = getArtifact(artifactId);
        return currentArtifact?.state || null;
    }, [artifactId, getArtifact]);

    // Set artifact mcp tools to the global store
    const handleMCPConnected = useCallback(
        (tools: Record<string, any>) => {
            setTools(tools);
        },
        [setTools],
    );

    // Handle mcp connection error
    const handleMCPConnectionError = useCallback(
        (error: Error) => {
            console.error('Artifact MCP connection error:', error);
            setConnectionError(true);
            clearTools();
        },
        [setConnectionError],
    );

    // Handle penpal connection error
    const handlePenpalConnectionError = useCallback(
        (error: Error) => {
            console.error('Penpal connection error:', error);
            setConnectionError(true);
        },
        [setConnectionError],
    );

    // Clear tools on unmount to avoid leaking session-scoped UI tools
    useEffect(() => {
        return () => {
            clearTools();
        };
    }, []);

    // Get artifact from store
    const artifact = getArtifact(artifactId);

    if (!artifact) {
        return <div>Artifact not found</div>;
    }
    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            {/* Header */}
            <ArtifactHeader title={artifact.title} connectionError={connectionError} />
            <div className="min-h-0 flex-1 overflow-hidden">
                <CapUIRenderer
                    key={artifactId}
                    srcUrl={artifact.source.url}
                    title={artifact.title}
                    artifact={true}
                    onSendPrompt={handleSendPrompt}
                    onAddSelection={handleAddSelection}
                    onSaveState={handleSaveState}
                    onGetState={handleGetState}
                    onMCPConnected={handleMCPConnected}
                    onMCPConnectionError={handleMCPConnectionError}
                    onPenpalConnectionError={handlePenpalConnectionError}
                />
            </div>
        </div>
    );
};
