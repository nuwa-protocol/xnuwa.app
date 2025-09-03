import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  streamText,
  type UIMessage,
} from 'ai';
import { generateUUID } from '@/shared/utils';
import { ChatStateStore } from '../stores';
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
  const { prompt, modelId, tools } = await capResolve.getResolvedConfig();

  // create a new chat session and update the messages
  const { updateMessages, addPaymentCtxIdToChatSession } =
    ChatStateStore.getState();
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
        model: llmProvider.chat(modelId),
        system: prompt,
        messages: convertToModelMessages(messages),
        experimental_transform: smoothStream({ chunking: 'word' }),
        tools,
        abortSignal: signal,
        maxRetries: 3,
        headers,
        onChunk: (chunk) => {
          if (hasSendOnResponseDataMark) return;
          writer.write({
            type: 'data-mark',
            data: 'onResponse',
          });
          hasSendOnResponseDataMark = true;
        },
      });
      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
          sendSources: true,
        }),
      );
    },
    onFinish: async ({ messages }) => {
      await updateMessages(chatId, messages);
    },
  });

  return createUIMessageStreamResponse({ stream });
};
