import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { ChevronDownIcon, ChevronUpIcon, PencilIcon } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { cn, sanitizeText } from '@/shared/utils';
import { Markdown } from './markdown';
import { MessageEditor } from './message-editor';

const MAX_MESSAGE_LENGTH = 150;

interface MessageTextProps {
  chatId: string;
  message: UIMessage;
  part: { type: 'text'; text: string };
  index: number;
  isReadonly: boolean;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  onModeChange: (mode: 'view' | 'edit') => void;
}

export const MessageText = ({
  chatId,
  message,
  part,
  index,
  isReadonly,
  setMessages,
  reload,
  onModeChange,
}: MessageTextProps) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [isExpanded, setIsExpanded] = useState(false);

  const key = `message-${message.id}-part-${index}`;

  const handleModeChange = (newMode: 'view' | 'edit') => {
    setMode(newMode);
    onModeChange(newMode);
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
      <div key={key} className="flex flex-row gap-2 items-start">
        {message.role === 'user' && !isReadonly && (
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
                <PencilIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit message</TooltipContent>
          </Tooltip>
        )}

        <div
          data-testid="message-content"
          className={cn('flex flex-col w-full', {
            'bg-purple-200 dark:bg-purple-700 px-3 py-2 rounded-xl':
              message.role === 'user',
          })}
        >
          <Markdown>{sanitizeText(displayText)}</Markdown>

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
          reload={reload}
        />
      </div>
    );
  }

  return null;
};
