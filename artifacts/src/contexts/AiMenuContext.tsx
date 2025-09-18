import React, { createContext, useContext, useMemo, useState } from 'react';

type AiMenuContextValue = {
  aiGenerateOpen: boolean;
  setAiGenerateOpen: (open: boolean) => void;
};

const AiMenuContext = createContext<AiMenuContextValue | undefined>(undefined);

export function AiMenuProvider({ children }: { children: React.ReactNode }) {
  const [aiGenerateOpen, setAiGenerateOpen] = useState(false);

  const value = useMemo(
    () => ({ aiGenerateOpen, setAiGenerateOpen }),
    [aiGenerateOpen],
  );

  return <AiMenuContext.Provider value={value}>{children}</AiMenuContext.Provider>;
}

export function useAiMenu() {
  const ctx = useContext(AiMenuContext);
  if (!ctx) throw new Error('useAiMenu must be used within AiMenuProvider');
  return ctx;
}

