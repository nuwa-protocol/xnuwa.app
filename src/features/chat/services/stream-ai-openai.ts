// New OpenAI-based StreamAIResponse implementation

import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from 'ai';
import OpenAI from 'openai';
import { createPaymentFetch } from '@/shared/services/payment-fetch';
import type { CapModel } from '@/shared/types';
import { generateUUID } from '@/shared/utils';
import { ChatSessionsStore } from '../stores';
import { CapResolve } from './cap-resolve';
import {
  convertToolsToOpenAI,
  convertUIMessagesToOpenAIMessages,
  writeOpenaAIChunkToUIMessageStream,
} from './openai-converters';

// Create OpenAI client with payment integration
function createOpenAIClient(model: CapModel, headers: Record<string, string>) {
  return new OpenAI({
    apiKey: 'NOT-USED', // Your gateway doesn't need real API key
    baseURL: model.gatewayUrl,
    fetch: createPaymentFetch(model.gatewayUrl) as any,
    dangerouslyAllowBrowser: true,
    fetchOptions: {
      headers,
    } as any,
  });
}

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
  // Resolve cap configuration (unchanged)
  const capResolve = new CapResolve();
  const { prompt, model, tools } = await capResolve.getResolvedConfig();

  // Create payment CTX id header (unchanged)
  const paymentCtxId = generateUUID();
  const headers = {
    'X-Client-Tx-Ref': paymentCtxId,
    'content-type': 'application/json',
  };

  // Update messages and payment context (unchanged)
  const { updateMessages, addPaymentCtxIdToChatSession } =
    ChatSessionsStore.getState();
  await updateMessages(chatId, messages);

  await addPaymentCtxIdToChatSession(chatId, {
    type: 'chat-message',
    message: (() => {
      const lastMessage = messages[messages.length - 1];
      const textPart = lastMessage.parts?.find((part) => part.type === 'text');
      return textPart?.text || 'User message';
    })(),
    ctxId: paymentCtxId,
    timestamp: Date.now(),
  });

  // Create OpenAI client
  const openai = createOpenAIClient(model, headers);

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      let hasSendOnResponseDataMark = false;

      try {
        // Convert inputs to OpenAI format
        const openaiMessages = convertUIMessagesToOpenAIMessages(messages);
        const openaiTools = convertToolsToOpenAI(
          Array.isArray(tools) ? tools : [],
        );

        // Create OpenAI completion stream
        const completion = await openai.chat.completions.create(
          {
            model: model.modelId,
            messages: [{ role: 'system', content: prompt }, ...openaiMessages],
            tools: openaiTools.length > 0 ? openaiTools : undefined,
            stream: true,
            temperature: model.parameters?.temperature,
          },
          {
            signal, // Pass abort signal
          },
        );

        // Process streaming chunks
        for await (const chunk of completion) {
          // Send onResponse marker on first chunk
          if (!hasSendOnResponseDataMark) {
            writer.write({
              type: 'data-mark',
              data: 'onResponse',
            });
            hasSendOnResponseDataMark = true;
          }
          writeOpenaAIChunkToUIMessageStream(chunk, writer);
        }
      } catch (error) {
        // Handle errors
        writer.write({
          type: 'error',
          errorText: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    },
    onFinish: async ({ messages }) => {
      await updateMessages(chatId, messages);
    },
  });

  return createUIMessageStreamResponse({ stream });
};
