// chat-instance-store.ts
// Store for managing Chat instances in memory without persistence

import { Chat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';
import { create } from 'zustand';
import { generateUUID } from '@/shared/utils';
import { createClientAIFetch } from '../services';

interface ChatInstanceStoreState {
  instances: Map<string, Chat<UIMessage>>;

  // Instance management
  getInstance: (
    chatId: string,
    initialMessages: UIMessage[],
    callbacks: {
      onError: (error: Error) => void;
      onFinish: () => void;
      onData: (data: any) => void;
    },
  ) => Chat<UIMessage>;
}

export const ChatInstanceStore = create<ChatInstanceStoreState>()(
  (set, get) => ({
    instances: new Map<string, Chat<UIMessage>>(),

    getInstance: (chatId: string, initialMessages: UIMessage[], callbacks) => {
      const { instances } = get();

      // Check if instance already exists
      const existingInstance = instances.get(chatId);
      if (existingInstance) {
        return existingInstance;
      }

      // Create new Chat instance
      const newChatInstance = new Chat({
        id: chatId,
        messages: initialMessages,
        generateId: generateUUID,
        transport: new DefaultChatTransport({
          fetch: createClientAIFetch(),
          prepareSendMessagesRequest: ({ id, messages }) => ({
            body: { id, messages },
          }),
        }),
        onError: callbacks.onError,
        onFinish: callbacks.onFinish,
        onData: callbacks.onData,
      });

      // Store the new instance using queueMicrotask to avoid setState during render
      queueMicrotask(() => {
        set((state) => {
          const newInstances = new Map(state.instances);
          newInstances.set(chatId, newChatInstance);
          return { instances: newInstances };
        });
      });

      return newChatInstance;
    },
  }),
);
