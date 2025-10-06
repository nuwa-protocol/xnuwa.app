// chat-sessions-store.ts
// Store for managing chat sessions and message history with persisted storage

import type { LanguageModelUsage, UIMessage } from 'ai';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createChatSessionsPersistConfig } from '@/shared/storage';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import type { LocalCap } from '@/features/cap-studio/types';
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
    // initialize with the currently selected cap
    caps: [currentCap],
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
  // Persist artifact UI state per-cap within a chat session
  updateChatSessionArtifactState: (
    chatId: string,
    capKey: string,
    state: any,
  ) => void;
  // Read artifact UI state for a cap within a chat session
  getChatSessionArtifactState: (chatId: string, capKey: string) => any;
  // Add a cap to the session. If it already exists, move it to the end (most recently used).
  // Note: Local cap and remote cap with the same id are considered different.
  addChatSessionCap: (id: string, cap: Cap | LocalCap) => void;
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

      addChatSessionCap: (id: string, cap: Cap | LocalCap) => {
        get().upsertSession(id, (prev) => {
          const prevCaps = prev.caps || [];

          // determine if cap already exists
          const isLocal = (c: Cap | LocalCap): c is LocalCap =>
            !!c && typeof c === 'object' && 'capData' in c;

          const dupIndex = prevCaps.findIndex((c) => {
            const aLocal = isLocal(c);
            const bLocal = isLocal(cap);
            // Local vs remote with same id are different
            if (aLocal !== bLocal) return false;
            // When both local: compare by local id
            // When both remote: compare by cap id
            return c.id === (cap as any).id;
          });

          let nextCaps: (Cap | LocalCap)[];
          if (dupIndex >= 0) {
            // move existing to the end
            const copy = prevCaps.slice();
            const [existing] = copy.splice(dupIndex, 1);
            copy.push(existing);
            nextCaps = copy;
          } else {
            nextCaps = [...prevCaps, cap];
          }

          return {
            caps: nextCaps,
            updatedAt: Date.now(),
          };
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

      updateChatSessionArtifactState: (
        chatId: string,
        capKey: string,
        artifactState: any,
      ) => {
        get().upsertSession(chatId, (prev) => {
          const prevMap = prev.artifactStates || {};
          return {
            // Do not touch session.updatedAt here
            artifactStates: {
              ...prevMap,
              [capKey]: {
                value: artifactState,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      getChatSessionArtifactState: (chatId: string, capKey: string) => {
        const session: any = get().chatSessions[chatId];
        // New per-cap state first
        const perCap = session?.artifactStates?.[capKey];
        if (perCap) return perCap;
        // Fallback: legacy single artifactState on session
        return session?.artifactState;
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
