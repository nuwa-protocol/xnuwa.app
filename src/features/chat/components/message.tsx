import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';

import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from '@/shared/components/ui/shadcn-io/tool';
import { cn } from '@/shared/utils';
import { useChatContext } from '../contexts/chat-context';
import { MessageActions } from './message-actions';
import { MessageReasoning } from './message-reasoning';
import { MessageSource } from './message-source';
import { MessageText } from './message-text';
import { PreviewAttachment } from './preview-attachment';
import { ToolResult } from './tool-result';

const PurePreviewMessage = ({
  index,
  message,
  isReadonly,
  userMessagesHeight,
}: {
  index: number;
  message: UIMessage;
  isReadonly: boolean;
  userMessagesHeight: number;
}) => {
  const { chat } = useChatContext();
  const { messages, status, setMessages, regenerate } = useChat({ chat });

  const [mode, setMode] = useState<'view' | 'edit'>('view');


  const attachmentsFromMessage = (message.parts || []).filter(
    (part) => part.type === 'file',
  );



  // calculate the minimum height of the message
  const getMessageMinHeight = (shouldPushToTop: boolean, role: string) => {
    if (shouldPushToTop && role === 'assistant') {
      const headerHeight = 195;
      const calculatedMinHeight = Math.max(
        0,
        window.innerHeight - headerHeight - userMessagesHeight,
      );
      return calculatedMinHeight > 0 ? `${calculatedMinHeight}px` : undefined;
    }
    return undefined;
  };

  const isStreaming =
    status === 'streaming' && messages.length - 1 === index;
  const isStreamingReasoning =
    isStreaming &&
    message.role === 'assistant' &&
    message.parts?.some((part) => part.type === 'reasoning') &&
    !message.parts?.some((part) => part.type === 'text');

  const shouldPushToTop = status === 'submitted' && index === messages.length - 1;
  const minHeight = getMessageMinHeight(shouldPushToTop, message.role);


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
            {attachmentsFromMessage.length > 0 && (
              <div
                data-testid={`message-attachments`}
                className="flex flex-row gap-2 justify-end"
              >
                {attachmentsFromMessage.map((attachment) => (
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

            {/* render source */}
            {(() => {
              const sources: any[] = [];
              message.parts?.forEach((part) => {
                if (part.type === 'source-url') {
                  sources.push(part.url);
                }
              });
              if (sources.length === 0) return null;
              return (
                <MessageSource
                  key={`sources-${message.id}`}
                  sources={sources}
                  className="mb-2"
                />
              );
            })()}

            {/* render message parts */}
            {message.parts?.map((part, index) => {
              // const processedTypes = new Set(['reasoning', 'source']);
              // if (processedTypes.has(part.type)) return null;

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
                    chatId={chat.id}
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

              if (type === 'dynamic-tool') {
                const { toolCallId, state, input, output, toolName } = part;
                return (
                  <Tool key={toolCallId} defaultOpen={false}>
                    <ToolHeader type={`tool-${toolName}`} state={state} />
                    <ToolContent>
                      {state === 'input-available' && <ToolInput input={input} />}
                      {state === 'output-available' && (
                        <div>
                          <ToolInput input={input} />
                          <ToolOutput
                            output={
                              <ToolResult
                                toolName={toolName}
                                result={output}
                                toolCallId={toolCallId}
                              />
                            }
                            errorText={undefined}
                          />
                        </div>

                      )}
                    </ToolContent>
                  </Tool>
                );
              }

              return null;
            })}



            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                message={message}
                isStreaming={isStreaming}
              />
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
    // For non-streaming messages, use normal memo optimization
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;

    return true;
  },
);
