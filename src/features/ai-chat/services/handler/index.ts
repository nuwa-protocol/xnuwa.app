import type { LanguageModelV1Source } from '@ai-sdk/provider';
import {
  appendResponseMessages,
  type Message,
  smoothStream,
  streamText,
} from 'ai';
import { ChatStateStore } from '@/features/ai-chat/stores/chat-store';
import { llmProvider } from '@/features/ai-provider/services';
import { ModelStateStore } from '@/features/ai-provider/stores';
import { SettingsStateStore } from '@/features/settings/stores';
import { generateUUID } from '@/shared/utils';
import { systemPrompt } from '../prompts';
import { createDocument } from '../tools/create-document';
import { updateDocument } from '../tools/update-document';

// Error handling function
function errorHandler(error: unknown) {
  if (error == null) {
    return 'unknown error';
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

function appendSourcesToFinalMessages(
  finalMessages: Message[],
  messageId: string,
  sources: LanguageModelV1Source[],
): Message[] {
  return finalMessages.map((message) => {
    if (message.id === messageId) {
      return {
        ...message,
        parts: [
          ...(message.parts ?? []),
          ...sources.map((source) => ({
            type: 'source' as const,
            source,
          })),
        ],
      };
    }
    return message;
  });
}

// Handle AI request, entrance of the AI workflow
const handleAIRequest = async ({
  sessionId,
  messages,
  signal,
}: {
  sessionId: string;
  messages: Message[];
  signal?: AbortSignal;
}) => {
  const { updateMessages, createStreamId } = ChatStateStore.getState();

  await updateMessages(sessionId, messages);

  // Create streamId for stream resumption
  const streamId = generateUUID();
  createStreamId(streamId, sessionId);

  // get selected model
  const selectedModel = ModelStateStore.getState().selectedModel;
  const isDevMode = SettingsStateStore.getState().settings.devMode;

  const result = streamText({
    model: llmProvider.chat(),
    system: systemPrompt(),
    messages,
    maxSteps: 5,
    experimental_activeTools:
      selectedModel.supported_parameters.includes('tools') && isDevMode
        ? ['createDocument', 'updateDocument']
        : [],
    experimental_transform: smoothStream({ chunking: 'word' }),
    experimental_generateMessageId: generateUUID,
    tools: {
      createDocument: createDocument(),
      updateDocument: updateDocument(),
    },
    abortSignal: signal,
    async onFinish({ response, reasoning, sources }) {
      const finalMessages = appendResponseMessages({
        messages: messages,
        responseMessages: response.messages,
      });

      // the appendResponseMessages function above does not append sources to the final messages
      // so we need to append them manually
      await updateMessages(
        sessionId,
        appendSourcesToFinalMessages(
          finalMessages,
          response.messages[0].id,
          sources,
        ),
      );
    },
  });

  const dataStreamResponse = result.toDataStreamResponse({
    getErrorMessage: errorHandler,
    sendReasoning: true,
    sendSources: true,
  });

  return dataStreamResponse;

  // To do: add stream resumption
  // const streamContext = getStreamContext();

  // if (streamContext) {
  //   const resumedStream = await streamContext.resumableStream(
  //     streamId,
  //     () => dataStreamResponse.body!
  //   );
  //   return new Response(resumedStream);
  // } else {
  //   return dataStreamResponse;
  // }
};

export { handleAIRequest };
