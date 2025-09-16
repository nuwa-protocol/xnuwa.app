import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { useDeleteMessagesAfterId } from '../hooks/use-delete-messages-after-id';

export type MessageEditorProps = {
  chatId: string;
  message: UIMessage;
  setMode: Dispatch<SetStateAction<'view' | 'edit'>>;
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
  regenerate: UseChatHelpers<UIMessage>['regenerate'];
};

export function MessageEditor({
  chatId,
  message,
  setMode,
  setMessages,
  regenerate,
}: MessageEditorProps) {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [draftContent, setDraftContent] = useState<string>(
    message.parts.find((part) => part.type === 'text')?.text ?? '',
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { deleteMessagesAfterId } = useDeleteMessagesAfterId();

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(event.target.value);
    adjustHeight();
  };

  const handleSend = async () => {
    setIsSubmitting(true);

    const updatedMessage = {
      ...message,
      content: draftContent,
      parts: message.parts.map((part) => {
        if (part.type === 'text') {
          return { ...part, text: draftContent };
        }
        return part;
      }),
    };

    // Update UI state - keep messages up to and including the edited message
    setMessages((messages) => {
      const index = messages.findIndex((m) => m.id === message.id);

      if (index !== -1) {
        return [...messages.slice(0, index), updatedMessage];
      }
      return messages;
    });

    // Update database - delete all messages after this one and update this message
    await deleteMessagesAfterId(chatId, message.id, updatedMessage);

    setMode('view');
    regenerate();
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Textarea
        data-testid="message-editor"
        ref={textareaRef}
        className="bg-transparent outline-none overflow-auto resize-none !text-base rounded-xl w-full max-h-32"
        value={draftContent}
        onChange={handleInput}
      />

      <div className="flex flex-row gap-2 justify-end">
        <Button
          variant="outline"
          className="h-fit py-2 px-3"
          onClick={() => {
            setMode('view');
          }}
        >
          Cancel
        </Button>
        <Button
          data-testid="message-editor-send-button"
          variant="default"
          className="h-fit py-2 px-3"
          disabled={isSubmitting}
          onClick={handleSend}
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
