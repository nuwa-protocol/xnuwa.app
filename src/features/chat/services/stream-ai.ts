import type { Cap } from '@nuwa-ai/cap-kit';
import {
  convertToModelMessages,
  createUIMessageStream,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai';
import { CurrentArtifactMCPToolsStore } from '@/shared/stores/current-artifact-store';
import { generateUUID } from '@/shared/utils';
import { ChatSessionsStore } from '../stores';
import { handleError } from '../utils/handl-error';
import { CapResolve } from './cap-resolve';
import { llmProvider } from './providers';

// Handle AI request, entrance of the AI workflow
export const CreateAIStream = async ({
  chatId,
  messages,
  signal,
  cap,
}: {
  chatId: string;
  messages: UIMessage[];
  signal?: AbortSignal;
  cap: Cap;
}) => {
  // Resolve cap configuration
  const capResolve = new CapResolve(cap);
  const {
    prompt,
    model,
    tools: remoteMCPTools,
  } = await capResolve.getResolvedConfig();

  // Add artifact tools
  const artifactTools = CurrentArtifactMCPToolsStore.getState().getTools();

  const mergedTools = artifactTools
    ? {
        ...remoteMCPTools,
        ...artifactTools,
      }
    : remoteMCPTools;

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
        tools: mergedTools,
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
            if (error == null) {
              return 'Unknown error';
            }
            if (typeof error === 'string') {
              return error;
            }
            if (error instanceof Error) {
              return error.message;
            }
            return JSON.stringify(error);
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

  return stream;
};
