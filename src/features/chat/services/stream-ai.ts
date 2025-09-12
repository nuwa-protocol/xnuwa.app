import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai';
import { generateUUID } from '@/shared/utils';
import { ChatSessionsStore } from '../stores';
import { handleError } from '../utils/handl-error';
import { CapResolve } from './cap-resolve';
import { llmProvider } from './providers';

// Handle AI request, entrance of the AI workflow
export const StreamAIResponse = async ({
  chatId,
  messages,
  signal,
}: {
  chatId: string;
  messages: UIMessage[];
  signal?: AbortSignal;
}) => {
  // Resolve cap configuration
  const capResolve = new CapResolve();
  const { prompt, model, tools } = await capResolve.getResolvedConfig();

  // create a new chat session and update the messages
  const { updateMessages, addPaymentCtxIdToChatSession } =
    ChatSessionsStore.getState();
  await updateMessages(chatId, messages);

  // create payment CTX id header
  const paymentCtxId = generateUUID();
  const headers = {
    'X-Client-Tx-Ref': paymentCtxId,
  };

  // add payment info to chat session
  await addPaymentCtxIdToChatSession(chatId, {
    type: 'chat-message',
    message: (() => {
      const lastMessage = messages[messages.length - 1];
      // In v5, extract text from parts array
      const textPart = lastMessage.parts?.find((part) => part.type === 'text');
      return textPart ? textPart.text : 'User message';
    })(),
    ctxId: paymentCtxId,
    timestamp: Date.now(),
  });

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: ({ writer }) => {
      let hasSendOnResponseDataMark = false;
      const result = streamText({
        model: llmProvider.chat(model),
        system: prompt,
        messages: convertToModelMessages(messages),
        tools,
        abortSignal: signal,
        maxRetries: 3,
        stopWhen: stepCountIs(10),
        headers,
        onChunk: (chunk) => {
          if (hasSendOnResponseDataMark) return;
          writer.write({
            type: 'data-mark',
            data: 'onResponse',
          });
          hasSendOnResponseDataMark = true;
        },
        onError: (error: any) => {
          handleError(error);
        },
      });
      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
          sendSources: true,
          onError: (error: any) => {
            return error.toString();
          },
        }),
      );
      result.finishReason.then((finishReason) => {
        writer.write({
          type: 'data-finishReason',
          data: { finishReason },
        });
      });
    },
    onFinish: async ({ messages }) => {
      await updateMessages(chatId, messages);
    },
  });

  return createUIMessageStreamResponse({ stream });
};
