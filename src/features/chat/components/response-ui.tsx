import { useChat } from '@ai-sdk/react';
import { CapUIRenderer } from '@/shared/components/cap-ui-renderer';
import { useChatContext } from '../contexts/chat-context';
import { ChatSessionsStore } from '../stores/chat-sessions-store';

interface ResponseUIProps {
    srcUrl: string;
    title?: string;
}

export const ResponseUI = ({ srcUrl, title }: ResponseUIProps) => {
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
        <CapUIRenderer
            srcUrl={srcUrl}
            title={title}
            onSendPrompt={handleSendPrompt}
            onAddSelection={handleAddSelection}
            onSaveState={() => { }}
            onGetState={() => { }}
        />
    );
};
