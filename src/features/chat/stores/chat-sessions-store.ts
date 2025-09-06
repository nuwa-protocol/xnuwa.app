// chat-sessions-store.ts
// Store for managing chat sessions and message history with persisted storage

import type { UIMessage } from 'ai';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createChatSessionsPersistConfig } from '@/shared/storage';
import type { ChatPayment, ChatSession } from '../types';

// ================= Constants ================= //
export const createInitialChatSession = (chatId: string): ChatSession => ({
  id: chatId,
  title: 'New Chat',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  caps: [],
  messages: [],
  payments: [],
});

// chat store state interface
interface ChatSessionsStoreState {
  chatSessions: Record<string, ChatSession>;

  // session CRUD operations
  getChatSession: (id: string) => ChatSession | null;
  getChatSessionsSortedByUpdatedAt: () => ChatSession[];
  updateSession: (
    id: string,
    updates: Partial<Omit<ChatSession, 'id'>>,
  ) => void;
  addPaymentCtxIdToChatSession: (id: string, payment: ChatPayment) => void;
  deleteSession: (id: string) => void;

  // update messages for a session and create a new session if not founds
  updateMessages: (chatId: string, messages: UIMessage[]) => void;

  // utility methods
  clearAllSessions: () => void;
}

// ================= Persist Configuration ================= //

const persistConfig = createChatSessionsPersistConfig<ChatSessionsStoreState>({
  name: 'chat-storage',
  partialize: (state) => ({
    chatSessions: state.chatSessions,
  }),
});

// ================= Store Factory ================= //

export const ChatSessionsStore = create<ChatSessionsStoreState>()(
  persist(
    (set, get) => ({
      chatSessions: {},

      getChatSession: (id: string) => {
        const { chatSessions } = get();
        return chatSessions[id] || null;
      },

      getChatSessionsSortedByUpdatedAt: () => {
        const { chatSessions } = get();
        return Object.values(chatSessions).sort(
          (a, b) => b.updatedAt - a.updatedAt,
        );
      },

      updateSession: (
        id: string,
        updates: Partial<Omit<ChatSession, 'id'>>,
      ) => {
        set((state) => {
          let session = state.chatSessions[id];
          // if session not found, create new session
          if (!session) {
            session = {
              id: id,
              title: 'New Chat',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              messages: [],
              payments: [],
              caps: [],
            };
          }

          const updatedSession = {
            ...session,
            ...updates,
            updatedAt: Date.now(),
          };

          return {
            chatSessions: {
              ...state.chatSessions,
              [id]: updatedSession,
            },
          };
        });
      },

      addPaymentCtxIdToChatSession: (id: string, payment: ChatPayment) => {
        set((state) => {
          const session = state.chatSessions[id];
          // if session not found, create new session
          if (!session) {
            const newSession = {
              id: id,
              title: 'New Chat',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              messages: [],
              payments: [payment],
              caps: [],
            };

            return {
              chatSessions: {
                ...state.chatSessions,
                [id]: newSession,
              },
            };
          } else {
            const updatedSession = {
              ...session,
              payments: [...session.payments, payment],
              updatedAt: Date.now(),
            };

            return {
              chatSessions: {
                ...state.chatSessions,
                [id]: updatedSession,
              },
            };
          }
        });
      },

      deleteSession: (id: string) => {
        set((state) => {
          const { [id]: deleted, ...restSessions } = state.chatSessions;
          return {
            chatSessions: restSessions,
          };
        });
      },

      updateMessages: (chatId: string, messages: UIMessage[]) => {
        set((state) => {
          let session = state.chatSessions[chatId];
          let isNewSession = false;

          // if session not found, create new session
          if (!session) {
            isNewSession = true;
            session = {
              id: chatId,
              title: 'New Chat',
              createdAt: Date.now(),
              updatedAt: Date.now(),
              messages: [],
              payments: [],
              caps: [],
            };
          }

          // check if there are new messages to add
          const currentMessageIds = new Set(
            session.messages.map((msg) => msg.id),
          );
          const hasNewMessages = messages.some(
            (msg) => !currentMessageIds.has(msg.id),
          );

          // only update when there are new messages
          if (hasNewMessages || isNewSession) {
            const updatedSession = {
              ...session,
              messages: [...messages], // completely replace message list
              updatedAt: Date.now(),
            };

            const newState = {
              chatSessions: {
                ...state.chatSessions,
                [chatId]: updatedSession,
              },
            };

            return newState;
          }

          return state;
        });
      },

      clearAllSessions: () => {
        set({
          chatSessions: {},
        });
      },
    }),
    persistConfig,
  ),
);
