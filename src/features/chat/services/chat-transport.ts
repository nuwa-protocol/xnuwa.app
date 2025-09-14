import type { UIMessage } from '@ai-sdk/react';
import type { ChatRequestOptions, ChatTransport, UIMessageChunk } from 'ai';
import { CreateAIStream } from './stream-ai';

export class ClientChatTransport implements ChatTransport<UIMessage> {
  async sendMessages(
    options: {
      chatId: string;
      messages: UIMessage[];
      abortSignal: AbortSignal | undefined;
    } & {
      trigger: 'submit-message' | 'regenerate-message';
      messageId: string | undefined;
    } & ChatRequestOptions,
  ): Promise<ReadableStream<UIMessageChunk>> {
    const Stream = CreateAIStream({
      chatId: options.chatId,
      messages: options.messages,
      signal: options.abortSignal,
    });
    return Stream;
  }

  async reconnectToStream(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _options: {
      chatId: string;
    } & ChatRequestOptions,
  ): Promise<ReadableStream<UIMessageChunk> | null> {
    // This function normally handles reconnecting to a stream on the backend, e.g. /api/chat
    // Since this project has no backend, we can't reconnect to a stream, so this is intentionally no-op.
    return null;
  }
}
