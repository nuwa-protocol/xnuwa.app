import type { Cap } from '@nuwa-ai/cap-kit';
import {
  convertToModelMessages,
  createUIMessageStream,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai';
import { CapResolve } from '@/shared/services/cap-resolve';
import { llmProvider } from '@/shared/services/llm-providers';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { generateUUID } from '@/shared/utils';
import { handleError } from '@/shared/utils/handl-error';
import { ChatSessionsStore } from '../stores';

// Handle AI request, entrance of the AI workflow
export const CreateAIChatStream = async ({
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
  const artifactTools = CurrentCapStore.getState().getCurrentCapArtifactTools();

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

// Handle AI request from artifact
export const CreateAIRequestStream = async ({
  chatId,
  prompt,
  cap,
}: {
  chatId: string;
  prompt: string;
  cap: Cap;
}) => {
  const capResolve = new CapResolve(cap);
  const {
    prompt: capPrompt,
    model,
    tools,
  } = await capResolve.getResolvedConfig();

  // create payment CTX id header
  const paymentCtxId = generateUUID();
  const headers = {
    'X-Client-Tx-Ref': paymentCtxId,
  };

  const { addPaymentCtxIdToChatSession } = ChatSessionsStore.getState();
  await addPaymentCtxIdToChatSession(chatId, {
    type: 'ai-request',
    ctxId: paymentCtxId,
    timestamp: Date.now(),
  });

  return streamText({
    model: llmProvider.chat(model),
    system: capPrompt,
    prompt: prompt,
    tools: tools,
    maxRetries: 3,
    stopWhen: stepCountIs(10),
    headers,
    onError: (error: any) => {
      throw new Error(error);
    },
  });
};
