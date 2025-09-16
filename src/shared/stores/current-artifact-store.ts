import { create } from 'zustand';

interface CurrentArtifactMCPToolsState {
  // Tools keyed by chat/session id
  tools: Record<string, any> | null;

  // Set/replace tools for a given session
  setTools: (tools: Record<string, any>) => void;

  // Get tools for a session; returns empty object if none
  getTools: () => Record<string, any> | null;

  // Clear tools for a session
  clearTools: () => void;
}

export const CurrentArtifactMCPToolsStore =
  create<CurrentArtifactMCPToolsState>((set, get) => ({
    tools: null,

    setTools: (tools: Record<string, any>) => {
      set(() => {
        return { tools };
      });
    },

    getTools: () => {
      return get().tools;
    },

    clearTools: () => {
      set((state) => {
        return { tools: null };
      });
    },
  }));
