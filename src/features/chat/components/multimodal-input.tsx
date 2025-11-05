import { type UseChatHelpers, useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import cx from 'classnames';
import { ArrowUpIcon, StopCircleIcon } from 'lucide-react';
import type React from 'react';
import { memo, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useWindowSize } from 'usehooks-ts';
import { CapSelector } from '@/features/cap-store/components';
import { Button } from '@/shared/components/ui/button';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { useChatContext } from '../contexts/chat-context';
import { usePersistentInput } from '../hooks/use-persistent-input';
import { ChatSessionsStore } from '../stores';
import {
  type AttachmentData,
  AttachmentInput,
  usePasteAttachments,
} from './attachment-input';
import { ContextIndicator } from './context-indicator';
import { InputSelections } from './input-selections';
import { PreviewAttachment } from './preview-attachment';

function PureMultimodalInput({ className }: { className?: string }) {
  const { chat } = useChatContext();
  const { status, stop, setMessages, sendMessage } = useChat({
    chat,
  });
  const { input, setInput, textareaRef, clearInput } = usePersistentInput();
  const { width } = useWindowSize();
  const { isInitialized, getCurrentCap } = CurrentCapStore();
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const cap = getCurrentCap();

  // Route general typing to the chat input so users can start typing anywhere.
  // Similar to a command palette UX: we only react to plain character keys and Backspace
  // when the event target isn't already an editable element.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const hasMod = e.metaKey || e.ctrlKey || e.altKey;
      // Ignore if any modifiers (except Shift for capitals)
      if (hasMod) return;

      const target = e.target as HTMLElement | null;
      // Skip if typing inside an input/textarea/contenteditable already
      if (
        target &&
        target.closest(
          'input, textarea, [contenteditable="true"], [contenteditable=""]',
        )
      ) {
        return;
      }

      const isChar = key.length === 1 && !e.repeat; // letters, numbers, punctuation, including space
      const isBackspace = key === 'Backspace';
      if (!isChar && !isBackspace) return;

      // Focus our textarea and reflect the keystroke
      if (textareaRef.current) {
        e.preventDefault();
        textareaRef.current.focus();
        // Update value to include the typed character or remove last char on Backspace
        if (isBackspace) {
          setInput((prev) => prev.slice(0, -1));
        } else {
          setInput((prev) => prev + key);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setInput, textareaRef]);

  // Remove attachment
  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const appendAttachments = useCallback((newAttachments: AttachmentData[]) => {
    setAttachments((prev) => [...prev, ...newAttachments]);
  }, []);

  const handlePaste = usePasteAttachments({
    onAttachmentsAdd: appendAttachments,
  });

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
      cap?.core?.mcpServers && Object.keys(cap.core.mcpServers).length > 0;

    if (hasMCPServers && !isInitialized) {
      toast.warning('Agent MCP is initializing, please try again later');
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
        <div className="pointer-events-none absolute left-0 right-0 bottom-full z-20 mb-2">
          <div className="pointer-events-auto flex flex-wrap gap-2 p-2">
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
        </div>
      )}

      <div
        className={cx(
          'flex flex-col shadow-md rounded-2xl border border-border focus-within:border-theme-500 focus-within:shadow-xl',
          className,
        )}
      >
        {/* Selections */}
        <InputSelections />
        <div className="flex flex-row ">
          {/*  Input Textarea */}
          <textarea
            data-testid="multimodal-input"
            ref={textareaRef}
            placeholder="Send a message..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onPaste={handlePaste}
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

          <div className="flex flex-col justify-center items-center p-2">
            <ContextIndicator />
          </div>
        </div>

        {/* Cap Selector and Send Button */}
        <div className="flex justify-between items-center p-2">
          <div className="flex items-center gap-2 justify-between w-full">
            <div className="flex items-center gap-2">
              <CapSelector />
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
    cap?.core?.mcpServers && Object.keys(cap.core.mcpServers).length > 0;

  const hasContent = input.trim().length > 0 || attachments.length > 0;

  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={!hasContent || (hasMCPServers && (!isInitialized || isError))}
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
