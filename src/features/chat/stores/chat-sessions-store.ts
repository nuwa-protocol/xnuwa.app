// chat-sessions-store.ts
// Store for managing chat sessions and message history with persisted storage

import type { LanguageModelUsage, UIMessage } from 'ai';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createChatSessionsPersistConfig } from '@/shared/storage';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import type { Cap } from '@/shared/types';
import type { ChatPayment, ChatSelection, ChatSession } from '../types';

// ================= Constants ================= //
export const createInitialChatSession = (chatId: string): ChatSession => {
  const { currentCap } = CurrentCapStore.getState();
  if (!currentCap) {
    throw new Error('No current cap found');
  }
  return {
    id: chatId,
    title: 'New Chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    payments: [],
    cap: currentCap,
    contextUsage: {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      reasoningTokens: 0,
      cachedInputTokens: 0,
    },
  };
};

// chat store state interface
interface ChatSessionsStoreState {
  chatSessions: Record<string, ChatSession>;

  // session CRUD operations
  getChatSession: (id: string) => ChatSession | null;
  getChatSessionsSortedByUpdatedAt: () => ChatSession[];
  // Safely update a session; create it first if it doesn't exist.
  // The updater returns a partial to merge or a full session object.
  upsertSession: (
    id: string,
    updater: (
      prev: ChatSession,
    ) => Partial<Omit<ChatSession, 'id'>> | ChatSession,
  ) => void;
  updateSession: (
    id: string,
    updates: Partial<Omit<ChatSession, 'id'>>,
  ) => void;
  addSelectionToChatSession: (id: string, selection: ChatSelection) => void;
  removeSelectionFromChatSession: (id: string, selectionId: string) => void;
  addPaymentCtxIdToChatSession: (id: string, payment: ChatPayment) => void;
  updateChatSessionArtifactState: (id: string, state: any) => void;
  getChatSessionArtifactState: (id: string) => any;
  setChatSessionCap: (id: string, cap: Cap) => void;
  updateChatSessionContextUsage: (
    id: string,
    usage: LanguageModelUsage,
  ) => void;
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

      upsertSession: (
        id: string,
        updater: (
          prev: ChatSession,
        ) => Partial<Omit<ChatSession, 'id'>> | ChatSession,
      ) => {
        set((state) => {
          // Ensure we have a base session to work with
          const base = state.chatSessions[id] || createInitialChatSession(id);
          const patch = updater(base) || {};

          // Always preserve the original id and shallow-merge changes
          const next: ChatSession = {
            ...base,
            ...(patch as Partial<Omit<ChatSession, 'id'>>),
            id: base.id,
          };

          return {
            chatSessions: {
              ...state.chatSessions,
              [id]: next,
            },
          };
        });
      },

      updateSession: (
        id: string,
        updates: Partial<Omit<ChatSession, 'id'>>,
      ) => {
        get().upsertSession(id, (prev) => ({
          ...updates,
          updatedAt: Date.now(),
        }));
      },

      addSelectionToChatSession: (id: string, selection: ChatSelection) => {
        get().upsertSession(id, (prev) => ({
          // Preserve existing behavior: do not touch updatedAt here
          selections: [...(prev.selections || []), selection],
        }));
      },

      removeSelectionFromChatSession: (id: string, selectionId: string) => {
        const session = get().getChatSession(id);
        if (!session?.selections?.length) {
          // No-op if the session doesn't exist or has no selections (preserve behavior)
          return;
        }

        get().upsertSession(id, (prev) => ({
          // Preserve existing behavior: do not touch updatedAt here
          selections: (prev.selections || []).filter(
            (s) => s.id !== selectionId,
          ),
        }));
      },

      addPaymentCtxIdToChatSession: (id: string, payment: ChatPayment) => {
        get().upsertSession(id, (prev) => ({
          payments: [...prev.payments, payment],
          updatedAt: Date.now(),
        }));
      },

      setChatSessionCap: (id: string, cap: Cap) => {
        get().upsertSession(id, (prev) => ({
          cap: cap,
          updatedAt: Date.now(),
        }));
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
        const session = get().getChatSession(chatId);
        const isNewSession = !session;

        // check if there are new messages to add
        const currentMessageIds = new Set(
          (session?.messages || []).map((msg) => msg.id),
        );
        const hasNewMessages = messages.some(
          (msg) => !currentMessageIds.has(msg.id),
        );

        // only update when there are new messages or when creating a new session
        if (hasNewMessages || isNewSession) {
          get().upsertSession(chatId, () => ({
            messages: [...messages], // completely replace message list
            updatedAt: Date.now(),
          }));
        }
      },

      updateChatSessionArtifactState: (chatId: string, artifactState: any) => {
        get().upsertSession(chatId, (prev) => ({
          // Preserve existing behavior: do not touch session.updatedAt here
          artifactState: {
            value: artifactState,
            updatedAt: Date.now(),
          },
        }));
      },

      getChatSessionArtifactState: (id: string) => {
        return get().chatSessions[id]?.artifactState;
      },

      updateChatSessionContextUsage: (
        id: string,
        usage: LanguageModelUsage,
      ) => {
        get().upsertSession(id, (prev) => ({
          contextUsage: {
            inputTokens:
              (prev.contextUsage.inputTokens || 0) + (usage.inputTokens || 0),
            outputTokens:
              (prev.contextUsage.outputTokens || 0) + (usage.outputTokens || 0),
            totalTokens:
              (prev.contextUsage.totalTokens || 0) + (usage.totalTokens || 0),
            reasoningTokens:
              (prev.contextUsage.reasoningTokens || 0) +
              (usage.reasoningTokens || 0),
            cachedInputTokens:
              (prev.contextUsage.cachedInputTokens || 0) +
              (usage.cachedInputTokens || 0),
          },
          updatedAt: Date.now(),
        }));
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
