import { useChat } from '@ai-sdk/react';
import type { StreamAIRequest } from '@nuwa-ai/ui-kit';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useChatContext } from '@/features/chat/contexts/chat-context';
import { ChatSessionsStore } from '@/features/chat/stores/chat-sessions-store';
import { CapUIRenderer } from '@/shared/components/cap-ui-renderer';
import type { ChildStreamMethods } from '@/shared/hooks/use-cap-ui-render';
import { CurrentArtifactMCPToolsStore } from '@/shared/stores/current-artifact-store';
import { generateUUID } from '@/shared/utils';
import { ChatErrorCode, handleError } from '@/shared/utils/handl-error';
import { CreateAIStream } from '../../services';
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
    const navigate = useNavigate();
    // Track active streams' abort flags
    const streamAbortMap = useRef(new Map<string, { aborted: boolean }>());

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

    // Handle stream request
    const handleStreamRequest = useCallback(
        async (
            request: StreamAIRequest,
            streamId: string,
            child: ChildStreamMethods,
        ) => {
            const token = { aborted: false };
            streamAbortMap.current.set(streamId, token);
            try {
                if (request.schema) {
                    // TODO: Implement schema stream
                    // const { partialObjectStream } = await CreateAIStream({
                    //     artifactId,
                    //     request,
                    // });
                    // for await (const partial of partialObjectStream as AsyncIterable<any>) {
                    //     if (token.aborted) return;
                    //     child.pushStreamChunk(streamId, {
                    //         type: 'content',
                    //         content: partial,
                    //     });
                    // }
                } else {
                    const { textStream } = await CreateAIStream({
                        artifactId,
                        request,
                    });
                    for await (const textPart of textStream as AsyncIterable<string>) {
                        if (token.aborted) return;
                        child.pushStreamChunk(streamId, {
                            type: 'content',
                            content: textPart,
                        });
                    }
                }
                if (!token.aborted) child.completeStream(streamId);
            } catch (error) {
                const errorCode = handleError(error as Error);
                switch (errorCode) {
                    case ChatErrorCode.IGNORED_ERROR:
                        return;
                    case ChatErrorCode.INSUFFICIENT_FUNDS:
                        toast.warning('Insufficient funds', {
                            description: 'Please top up your balance to continue',
                            duration: 8000,
                            action: {
                                label: 'Go to Wallet',
                                onClick: () => navigate('/wallet'),
                            },
                        });
                        break;
                    default:
                        toast.error('An error occurred', {
                            description: 'Please check your network connection and try again',
                            action: {
                                label: 'Retry',
                                onClick: () =>
                                    console.warn(
                                        'Retry action needs to be handled by the component',
                                    ),
                            },
                        });
                }
            } finally {
                streamAbortMap.current.delete(streamId);
            }
        },
        [artifactId],
    );

    // Handle abort stream
    const handleAbortStream = useCallback((streamId: string) => {
        const t = streamAbortMap.current.get(streamId);
        if (t) t.aborted = true;
    }, []);

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
            <ArtifactHeader
                title={artifact.title}
                connectionError={connectionError}
            />
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
                    onStreamRequest={handleStreamRequest}
                    onAbortStream={handleAbortStream}
                />
            </div>
        </div>
    );
};
