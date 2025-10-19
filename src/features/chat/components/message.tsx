import type { UseChatHelpers } from '@ai-sdk/react';
import { isUIResource, type UIResource } from '@nuwa-ai/ui-kit';
import type { ToolUIPart, UIMessage } from 'ai';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';
import {
  isOnResponseDataMarkPart,
  type OnResponseDataMarkPart,
} from '@/features/chat/types/marks';
import { TextShimmer } from '@/shared/components/ui/text-shimmer';
import { cn } from '@/shared/utils';
import { Loader } from './loader';
import { MessageActions } from './message-actions';
import { MessageCap } from './message-cap';
import { ClearContextMessage } from './message-clear-context';
import { MessageImage } from './message-image';
import { RemoteMCPTool } from './message-mcp-tool';
import { MessageMCPUI } from './message-mcp-ui';
import { MessageReasoning } from './message-reasoning';
import { MessageSource } from './message-source';
import { MessageText } from './message-text';
import { PreviewAttachment } from './preview-attachment';

// Lightweight message signature to detect content changes cheaply.
// Helps catch in-place mutations during streaming while keeping comparator fast.
const messageSignature = (m: UIMessage) => {
  const parts = m.parts || [];
  let sig = `${m.role}|${parts.length}|`;
  for (let i = 0; i < parts.length; i++) {
    const p: any = parts[i];
    switch (p.type) {
      case 'text':
        sig += `t:${p.text?.length || 0}|`;
        break;
      case 'reasoning':
        sig += `r:${p.text?.length || 0}|`;
        break;
      case 'file':
        sig += `f:${p.url || ''}:${p.mediaType || ''}|`;
        break;
      case 'dynamic-tool':
        sig += `d:${p.toolCallId || ''}:${p.state || ''}|`;
        break;
      case 'source-url':
        sig += `s:${p.url || ''}|`;
        break;
      default:
        sig += `${p.type}|`;
        break;
    }
  }
  return sig;
};
const PurePreviewMessage = ({
  chatId,
  message,
  isReadonly,
  minHeight,
  isStreamingReasoning,
  isStreaming,
  setMessages,
  regenerate,
}: {
  chatId: string;
  message: UIMessage;
  isReadonly: boolean;
  minHeight: string | undefined;
  isStreamingReasoning: boolean;
  isStreaming: boolean;
  setMessages: UseChatHelpers<UIMessage>['setMessages'];
  regenerate: UseChatHelpers<UIMessage>['regenerate'];
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const attachmentsFromUserMessage =
    message.role === 'user'
      ? (message.parts || []).filter((part) => part.type === 'file')
      : [];

  const isClearContextMessage =
    message.role === 'system' &&
    message.parts?.some(
      (part) => part.type === 'data-uimark' && part.data === 'clear-context',
    );
  const sources =
    message.parts
      ?.filter((part) => part.type === 'source-url')
      .map((part) => part.url) ?? [];

  if (isClearContextMessage) return <ClearContextMessage />;

  if (message.parts?.length === 0) return <Loader minHeight={minHeight} />;

  // Find the onResponse data mark part
  const onResponsePart = (() => {
    for (const part of message.parts || []) {
      if (isOnResponseDataMarkPart(part)) return part as OnResponseDataMarkPart;
    }
    return null;
  })();

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-4xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:pt-1 group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          <div
            className={cn('flex flex-col gap-4 w-full')}
            style={{
              minHeight: minHeight,
            }}
          >
            {/* Cap identity header for assistant messages when the onResponse mark is present */}
            {message.role === 'assistant' && onResponsePart && (
              <MessageCap part={onResponsePart} />
            )}
            {attachmentsFromUserMessage.length > 0 && (
              <div
                data-testid={`message-attachments`}
                className="flex flex-row gap-2 justify-end"
              >
                {attachmentsFromUserMessage.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={{
                      name: attachment.filename ?? 'file',
                      contentType: attachment.mediaType,
                      url: attachment.url,
                    }}
                  />
                ))}
              </div>
            )}

            {/* render message parts */}
            {message.parts
              ?.slice()
              .sort((a, b) => {
                if (a.type === 'reasoning' && b.type === 'text') return -1;
                if (a.type === 'text' && b.type === 'reasoning') return 1;
                return 0;
              })
              ?.map((part, index) => {
                const { type } = part;
                const key = `message-${message.id}-part-${index}`;

                if (type === 'reasoning' && part.text?.trim().length > 0) {
                  return (
                    <MessageReasoning
                      key={`reasoning-${message.id}-${index}`}
                      isStreaming={isStreamingReasoning}
                      content={part.text}
                    />
                  );
                }

                if (type === 'text') {
                  return (
                    <MessageText
                      key={key}
                      chatId={chatId}
                      message={message}
                      part={part}
                      index={index}
                      isReadonly={isReadonly}
                      setMessages={setMessages}
                      regenerate={regenerate}
                      onModeChange={setMode}
                    />
                  );
                }

                if (typeof type === 'string' && type.startsWith('tool-')) {
                  const rawToolName = type.slice('tool-'.length);
                  const formattedToolName = rawToolName
                    ? rawToolName
                      .replace(/[-_]/g, ' ')
                      .replace(/\b\w/g, (char) => char.toUpperCase())
                    : 'Tool';
                  const { state } = part as ToolUIPart;
                  if (state === 'input-streaming') {
                    return (
                      <TextShimmer
                        key={key}
                        className="text-sm font-medium tracking-wide"
                      >
                        {`Running ${formattedToolName}…`}
                      </TextShimmer>
                    );
                  }
                }

                if (type === 'file' && message.role === 'assistant') {
                  return (
                    <MessageImage
                      key={key}
                      imageName={part.filename}
                      base64={part.url}
                      mediaType={part.mediaType}
                      alt={part.filename || 'Generated Image'}
                    />
                  );
                }

                if (type === 'dynamic-tool') {
                  const { toolCallId, state, input, output, toolName } = part;

                  const uiRes = (output as any)?.content?.find((c: any) =>
                    isUIResource(c as any),
                  ) as UIResource;

                  if (uiRes)
                    return (
                      <MessageMCPUI
                        key={`mcp-ui-${toolCallId}`}
                        resource={uiRes}
                      />
                    );

                  return (
                    <RemoteMCPTool
                      key={toolCallId}
                      input={input}
                      output={output}
                      toolCallId={toolCallId}
                      toolName={toolName}
                      state={state}
                    />
                  );
                }

                return null;
              })}

            {(!isReadonly || sources.length > 0) && (
              <div className="flex items-center gap-3 pt-2">
                {!isReadonly && (
                  <MessageActions
                    key={`action-${message.id}`}
                    message={message}
                    isStreaming={isStreaming}
                  />
                )}
                {sources.length > 0 && (
                  <MessageSource
                    key={`sources-${message.id}`}
                    sources={sources}
                    className="ml-auto"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    // Re-render if any of these props change
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.isReadonly !== nextProps.isReadonly) return false;
    if (prevProps.minHeight !== nextProps.minHeight) return false;
    if (prevProps.isStreaming !== nextProps.isStreaming) return false;
    if (prevProps.isStreamingReasoning !== nextProps.isStreamingReasoning)
      return false;

    // Prefer immutability: if the message object reference changes, re-render
    if (prevProps.message !== nextProps.message) return false;

    // Fallback for in-place mutation: compare a lightweight signature
    if (
      messageSignature(prevProps.message) !==
      messageSignature(nextProps.message)
    )
      return false;

    return true;
  },
);
