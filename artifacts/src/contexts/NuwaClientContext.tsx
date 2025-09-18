import React, { createContext, useContext } from 'react';
import type { NuwaClient } from '@nuwa-ai/ui-kit';

// Minimal context to share a single NuwaClient instance across the editor tree.
// We keep responsibilities small: EditorPage still owns connecting/initializing
// and simply provides the established client here.
export type NuwaClientContextValue = {
  nuwaClient: NuwaClient;
};

const NuwaClientContext = createContext<NuwaClientContextValue | null>(null);

export function NuwaClientProvider({
  nuwaClient,
  children,
}: {
  nuwaClient: NuwaClient;
  children: React.ReactNode;
}) {
  return (
    <NuwaClientContext.Provider value={{ nuwaClient }}>
      {children}
    </NuwaClientContext.Provider>
  );
}

export function useNuwa() {
  const ctx = useContext(NuwaClientContext);
  if (!ctx) {
    throw new Error('useNuwa must be used within a NuwaClientProvider');
  }
  return ctx;
}

