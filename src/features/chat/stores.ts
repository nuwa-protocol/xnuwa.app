// chat-store.ts
// Store for managing chat sessions and message history with unified storage

import type { UIMessage } from 'ai';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NuwaIdentityKit } from '@/shared/services/identity-kit';
import { createPersistConfig, db } from '@/shared/storage';
import type { ChatPayment, ChatSession } from './types';

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

// get current DID
const getCurrentDID = async () => {
  const { getDid } = await NuwaIdentityKit();
  return await getDid();
};

// ================= Database Reference ================= //

const chatDB = db;

// chat store state interface
interface ChatSessionsStoreState {
  chatSessions: Record<string, ChatSession>;

  // session CRUD operations
  getChatSession: (id: string) => ChatSession | null;
  getChatSessionsSortedByUpdatedAt: () => ChatSession[];
  updateSession: (
    id: string,
    updates: Partial<Omit<ChatSession, 'id'>>,
  ) => Promise<void>;
  addPaymentCtxIdToChatSession: (
    id: string,
    payment: ChatPayment,
  ) => Promise<void>;
  deleteSession: (id: string) => void;

  // update messages for a session and create a new session if not founds
  updateMessages: (chatId: string, messages: UIMessage[]) => Promise<void>;

  // utility methods
  clearAllSessions: () => void;

  // data persistence
  loadFromDB: () => Promise<void>;
  saveToDB: () => Promise<void>;
}

// ================= Persist Configuration ================= //

const persistConfig = createPersistConfig<ChatSessionsStoreState>({
  name: 'chat-storage',
  getCurrentDID: getCurrentDID,
  partialize: (state) => ({
    chatSessions: state.chatSessions,
  }),
  onRehydrateStorage: () => (state) => {
    if (state) {
      state.loadFromDB();
    }
  },
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

      updateSession: async (
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

        await get().saveToDB();
      },

      addPaymentCtxIdToChatSession: async (
        id: string,
        payment: ChatPayment,
      ) => {
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

        await get().saveToDB();
      },

      deleteSession: (id: string) => {
        set((state) => {
          const { [id]: deleted, ...restSessions } = state.chatSessions;
          return {
            chatSessions: restSessions,
          };
        });

        // async delete related data
        const deleteFromDB = async () => {
          try {
            const currentDID = await getCurrentDID();
            if (!currentDID) return;

            await chatDB.chats
              .where(['did', 'id'])
              .equals([currentDID, id])
              .delete();
          } catch (error) {
            console.error('Failed to delete from DB:', error);
          }
        };
        deleteFromDB();
      },

      updateMessages: async (chatId: string, messages: UIMessage[]) => {
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

        await get().saveToDB();
      },

      clearAllSessions: () => {
        set({
          chatSessions: {},
        });

        // clear IndexedDB
        const clearDB = async () => {
          try {
            await chatDB.chats.clear();
          } catch (error) {
            console.error('Failed to clear DB:', error);
          }
        };
        clearDB();
      },

      loadFromDB: async () => {
        if (typeof window === 'undefined') return;

        try {
          const currentDID = await getCurrentDID();
          if (!currentDID) return;

          const chats = await chatDB.chats
            .where('did')
            .equals(currentDID)
            .toArray();

          // Sort by updatedAt in descending order
          const sortedChats = chats.sort(
            (a: ChatSession, b: ChatSession) => b.updatedAt - a.updatedAt,
          );
          const sessionsMap: Record<string, ChatSession> = {};

          sortedChats.forEach((chat: ChatSession) => {
            sessionsMap[chat.id] = chat;
          });

          set((state) => ({
            chatSessions: { ...state.chatSessions, ...sessionsMap },
          }));
        } catch (error) {
          console.error('Failed to load from DB:', error);
        }
      },

      saveToDB: async () => {
        if (typeof window === 'undefined') return;

        try {
          const currentDID = await getCurrentDID();
          if (!currentDID) return;

          const { chatSessions } = get();
          const chatsToSave = Object.values(chatSessions).map((session) => ({
            ...session,
            did: currentDID,
          }));

          // use bulkPut to efficiently update data
          await chatDB.chats.bulkPut(chatsToSave);
        } catch (error) {
          console.error('Failed to save to DB:', error);
        }
      },
    }),
    persistConfig,
  ),
);
