import { useChat } from '@ai-sdk/react';
import { IframeUIRenderer } from '@/shared/components/iframe-ui-renderer';
import { useChatContext } from '../contexts/chat-context';

interface ResponseUIProps {
  srcUrl: string;
  title?: string;
}

export const ResponseUI = ({ srcUrl, title }: ResponseUIProps) => {
  const { chat } = useChatContext();
  const { sendMessage } = useChat({ chat });

  const handleSendPrompt = (prompt: string) => {
    sendMessage({ text: prompt });
  };

  return (
    <IframeUIRenderer
      srcUrl={srcUrl}
      title={title}
      onSendPrompt={handleSendPrompt}
    />
  );
};
