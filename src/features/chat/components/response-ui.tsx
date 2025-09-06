import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { CapUIRenderer } from '@/shared/components/cap-ui-renderer';
import { useChatContext } from '../contexts/chat-context';

interface ResponseUIProps {
    srcUrl: string;
    title?: string;
}

export const ResponseUI = ({ srcUrl, title }: ResponseUIProps) => {
    const [isPenpalConnected, setIsPenpalConnected] = useState(false);
    const [isPenpalConnectionError, setIsPenpalConnectionError] = useState<Error | null>(null);
    const [isMCPConnected, setIsMCPConnected] = useState(false);
    const [isMCPConnectionError, setIsMCPConnectionError] = useState<Error | null>(null);

    const { chat } = useChatContext();
    const { sendMessage } = useChat({ chat });

    const handleSendPrompt = (prompt: string) => {
        sendMessage({ text: prompt });
    };

    const handleAddSelection = (label: string, message: string) => {
        // addSelection({ label, message });
    };

    const handleSaveState = (state: any) => {
        // saveState(state);
    };

    const handleGetState = () => {
        // getState();
    };

    return (
        <CapUIRenderer
            srcUrl={srcUrl}
            title={title}
            onSendPrompt={() => { }}
            onAddSelection={() => { }}
            onSaveState={() => { }}
            onGetState={() => { }}
            onPenpalConnected={() => setIsPenpalConnected(true)}
            onPenpalConnectionError={(e) => setIsPenpalConnectionError(e)}
            onMCPConnected={() => setIsMCPConnected(true)}
            onMCPConnectionError={(e) => setIsMCPConnectionError(e)}
        />
    );
};
