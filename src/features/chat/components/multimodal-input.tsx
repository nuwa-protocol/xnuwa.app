import { type UseChatHelpers, useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import cx from 'classnames';
import { ArrowUpIcon, StopCircleIcon } from 'lucide-react';
import type React from 'react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useWindowSize } from 'usehooks-ts';
import { Button } from '@/shared/components/ui/button';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { useChatContext } from '../contexts/chat-context';
import { usePersistentInput } from '../hooks/use-persistent-input';
import { ChatSessionsStore } from '../stores';
import { type AttachmentData, AttachmentInput } from './attachment-input';
import { ContextCostIndicator } from './context-cost-indicator';
import { InputSelections } from './input-selections';
import { PreviewAttachment } from './preview-attachment';

function PureMultimodalInput({ className }: { className?: string }) {
  const { chat } = useChatContext();
  const { messages, status, stop, setMessages, sendMessage } = useChat({
    chat,
  });
  const { input, setInput, textareaRef, clearInput } = usePersistentInput();
  const { width } = useWindowSize();
  const { isInitialized, getCurrentCap } = CurrentCapStore();
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const cap = getCurrentCap();

  // Remove attachment
  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Auto focus when chat ID changes (page navigation)
  useEffect(() => {
    if (textareaRef.current && width && width > 768) {
      textareaRef.current.focus();
    }
  }, [chat.id, width]);

  const handleSend = async () => {
    if (status === 'streaming' || status === 'submitted') {
      toast.warning(
        'Waiting for the model to finish processing the previous message...',
      );
      return;
    }

    // Check if Cap has MCP servers and if they are initialized
    const hasMCPServers =
      cap?.core?.mcpServers &&
      Object.keys(cap.core.mcpServers).length > 0;

    if (hasMCPServers && !isInitialized) {
      toast.warning('Cap MCP is initializing, please try again later');
      return;
    }

    if (input.trim() || attachments.length > 0) {
      sendMessage({
        text: input,
        files: attachments.length > 0 ? attachments : undefined,
      });

      clearInput();
      setAttachments([]);

      const currentUrlCid = searchParams.get('chat_id');
      if (currentUrlCid !== chat.id) {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('chat_id', chat.id);
        setSearchParams(newSearchParams);
      }
    }

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-4">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2">
          {attachments.map((attachment, index) => (
            <PreviewAttachment
              key={`${attachment.filename || 'file'}-${index}`}
              attachment={{
                name: attachment.filename || 'Unknown file',
                url: attachment.url,
                contentType: attachment.mediaType,
              }}
              onRemove={() => removeAttachment(index)}
            />
          ))}
        </div>
      )}

      <div
        className={cx(
          'flex flex-col rounded-2xl bg-muted dark:border-zinc-700 border border-input ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          className,
        )}
      >
        {/* Selections */}
        <InputSelections />

        {/*  Input Textarea */}
        <textarea
          data-testid="multimodal-input"
          ref={textareaRef}
          placeholder="Send a message..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="flex-1 min-h-[50px] max-h-[calc(25dvh-48px)] overflow-auto hide-scrollbar resize-none text-base bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none pt-3 px-3 pb-0"
          rows={2}
          autoFocus
          style={
            {
              fieldSizing: 'content',
            } as React.CSSProperties
          }
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();

              if (status !== 'ready') {
                console.warn(
                  'The model is not ready to respond. Currnet status:',
                  status,
                );
              }

              handleSend();
            }
          }}
        />

        {/* Cap Selector and Send Button */}
        <div className="flex justify-between items-center p-2">
          <div className="flex items-center gap-2 justify-between w-full">
            <div className="flex items-center gap-2">
              <ContextCostIndicator />
            </div>
            {status === 'submitted' || status === 'streaming' ? (
              <StopButton
                stop={stop}
                setMessages={setMessages}
                chatId={chat.id}
              />
            ) : (
              <div className="flex items-center gap-2">
                <AttachmentInput
                  attachments={attachments}
                  onAttachmentsChange={setAttachments}
                />
                <SendButton
                  input={input}
                  attachments={attachments}
                  submitForm={handleSend}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const MultimodalInput = PureMultimodalInput;

function PureStopButton({
  stop,
  setMessages,
  chatId,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
  chatId: string;
}) {
  const { updateMessages } = ChatSessionsStore();
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => {
          updateMessages(chatId, messages);
          return messages;
        });
      }}
    >
      <StopCircleIcon size={14} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
  submitForm,
  input,
  attachments,

}: {
  submitForm: () => void;
  input: string;
  attachments: AttachmentData[];
}) {

  const { isInitialized, getCurrentCap, isError } = CurrentCapStore();
  const cap = getCurrentCap();


  // Check if Cap has MCP servers
  const hasMCPServers =
    cap?.core?.mcpServers &&
    Object.keys(cap.core.mcpServers).length > 0;

  const hasContent = input.trim().length > 0 || attachments.length > 0;

  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={
        !hasContent ||
        (hasMCPServers && (!isInitialized || isError))
      }
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.attachments.length !== nextProps.attachments.length)
    return false;
  return true;
});
