import { useChat } from '@ai-sdk/react';
import {
    CapUIRenderer
} from '@/shared/components/cap-ui-renderer';
import { useChatContext } from '../contexts/chat-context';
import { ChatSessionsStore } from '../stores/chat-sessions-store';

export const Artifact = ({ artifactUrl }: { artifactUrl: string }) => {
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
        <div className="w-full h-full max-h-screen bg-gradient-to-br from-muted/20 to-background border border-border rounded-xl shadow-xl overflow-hidden">
            <CapUIRenderer
                srcUrl={artifactUrl}
                title="Artifact"
                artifact={true}
                onSendPrompt={handleSendPrompt}
                onAddSelection={handleAddSelection}
                onSaveState={() => { }}
                onGetState={() => { }}
            />
        </div>
    );
};
