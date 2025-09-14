import { useChat } from '@ai-sdk/react';
import { useCallback } from 'react';
import { CapUIRenderer } from '@/shared/components/cap-ui-renderer';
import { generateUUID } from '@/shared/utils';
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

    const handleSendPrompt = useCallback(
        (prompt: string) => {
            sendMessage({ text: prompt });
        },
        [sendMessage, chat],
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

    // temporary method to save state to local storage
    const handleSaveState = useCallback(
        (state: any) => {
            localStorage.setItem(`artifact_state_${artifactUrl}`, JSON.stringify(state));
        },
        [],
    );

    // temporary method to get state from local storage
    const handleGetState = useCallback(
        () => {
            const state = localStorage.getItem(`artifact_state_${artifactUrl}`);
            console.log('handle get state', state);
            return state ? JSON.parse(state) : null;
        },
        [],
    );
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
                    onSaveState={handleSaveState}
                    onGetState={handleGetState}
                />
            </div>
        </div>
    );
};
