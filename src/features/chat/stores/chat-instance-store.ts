// chat-instance-store.ts
// Store for managing Chat instances in memory without persistence

import { Chat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { create } from 'zustand';
import { handleError } from '@/shared/utils/handle-error';
import { ClientChatTransport } from '../services';

interface ChatInstanceStoreState {
  instances: Map<string, Chat<UIMessage>>;

  // Instance management
  getInstance: (
    chatId: string,
    initialMessages: UIMessage[],
    callbacks: {
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
        // If the instance was created before the chat sessions store rehydrated,
        // it might still have an empty message list. When we later get called
        // with the restored message history, hydrate the instance so the UI
        // shows the persisted conversation after refresh.
        if (
          (existingInstance.messages?.length ?? 0) === 0 &&
          (initialMessages?.length ?? 0) > 0
        ) {
          existingInstance.messages = initialMessages;
        }

        return existingInstance;
      }

      // Create new Chat instance
      const newChatInstance = new Chat({
        id: chatId,
        messages: initialMessages,
        transport: new ClientChatTransport(),
        onFinish: callbacks.onFinish,
        onData: callbacks.onData,
        onError: handleError,
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
