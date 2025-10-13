import { useChat } from '@ai-sdk/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useChatContext } from '@/features/chat/contexts/chat-context';

export const useMCPUI = () => {
  const { chat } = useChatContext();
  const { sendMessage, status } = useChat({ chat });
  const [hasConnectionError, setHasConnectionError] = useState<boolean>(false);

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

  // Handle penpal connection error
  const handlePenpalConnectionError = useCallback(
    (error: Error) => {
      console.error('Penpal connection error:', error);
      setHasConnectionError(true);
    },
    [setHasConnectionError],
  );

  return {
    hasConnectionError,
    handleSendPrompt,
    handlePenpalConnectionError,
  };
};
