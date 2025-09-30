import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  PencilIcon,
  RotateCcwIcon,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Streamdown } from 'streamdown';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard';
import { cn } from '@/shared/utils';
import { useDeleteMessagesAfterId } from '../hooks';
import { MessageEditor } from './message-editor';

const MAX_MESSAGE_LENGTH = 150;

interface MessageTextProps {
  chatId: string;
  message: UIMessage;
  part: { type: 'text'; text: string };
  index: number;
  isReadonly: boolean;
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
  regenerate: UseChatHelpers<UIMessage>['regenerate'];
  onModeChange: (mode: 'view' | 'edit') => void;
}

export const MessageText = ({
  chatId,
  message,
  part,
  index,
  isReadonly,
  setMessages,
  regenerate,
  onModeChange,
}: MessageTextProps) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyToClipboard, isCopied] = useCopyToClipboard();
  const { deleteMessagesAfterId } = useDeleteMessagesAfterId();

  const key = `message-${message.id}-part-${index}`;

  const handleModeChange = (newMode: 'view' | 'edit') => {
    setMode(newMode);
    onModeChange(newMode);
  };

  const handleResend = async () => {
    // Keep this message and delete all messages after it
    setMessages((messages) => {
      const index = messages.findIndex((m) => m.id === message.id);
      if (index !== -1) {
        return messages.slice(0, index + 1);
      }
      return messages;
    });

    // Update database to keep messages up to and including this message
    await deleteMessagesAfterId(chatId, message.id);

    regenerate();
  };

  const handleCopy = () => {
    copyToClipboard(part.text);
    toast.success('Copied to clipboard');
  };

  if (mode === 'view') {
    // Check if user message is long and should be collapsible
    const isUserMessageLong =
      message.role === 'user' && part.text.length > MAX_MESSAGE_LENGTH;
    const displayText =
      isUserMessageLong && !isExpanded
        ? `${part.text.substring(0, MAX_MESSAGE_LENGTH)}...`
        : part.text;

    return (
      <div key={key} className="flex flex-col gap-2 items-end">
        <div
          data-testid="message-content"
          className={cn(
            'flex flex-col',
            {
              'bg-purple-200 dark:bg-purple-700 px-3 py-2 rounded-xl':
                message.role === 'user',
            },
            {
              'w-full': message.role === 'assistant',
            },
          )}
        >
          <Streamdown parseIncompleteMarkdown={true}>{displayText}</Streamdown>

          {isUserMessageLong && (
            <Button
              variant="ghost"
              size="sm"
              className="self-end text-muted-foreground text-xs hover:bg-background/30 flex items-center gap-1"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  Show less <ChevronUpIcon className="h-3 w-3" />
                </>
              ) : (
                <>
                  Show more <ChevronDownIcon className="h-3 w-3" />
                </>
              )}
            </Button>
          )}
        </div>

        {message.role === 'user' && !isReadonly && (
          <div className="flex justify-end gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-testid="message-copy-button"
                  variant="ghost"
                  className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                  onClick={handleCopy}
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isCopied ? 'Copied!' : 'Copy message'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-testid="message-resend-button"
                  variant="ghost"
                  className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                  onClick={handleResend}
                >
                  <RotateCcwIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Resend message</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-testid="message-edit-button"
                  variant="ghost"
                  className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                  onClick={() => {
                    handleModeChange('edit');
                  }}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit message</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'edit') {
    return (
      <div key={key} className="flex flex-row w-full gap-2 items-start">
        <MessageEditor
          chatId={chatId}
          key={message.id}
          message={message}
          setMode={(newMode) => {
            if (typeof newMode === 'function') {
              const resolvedMode = newMode(mode);
              handleModeChange(resolvedMode);
            } else {
              handleModeChange(newMode);
            }
          }}
          setMessages={setMessages}
          regenerate={regenerate}
        />
      </div>
    );
  }

  return null;
};
