import { useCallback, useEffect, useState } from 'react';
import { MemoryStateStore } from '@/features/ai-chat/stores/memory-store';

export function useMemory() {
  const [memories, setMemories] = useState(
    MemoryStateStore.getState().memories,
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = MemoryStateStore.subscribe((state) => {
      setMemories(state.memories);
    });

    return unsubscribe;
  }, []);

  const getAllMemories = useCallback(() => {
    return Object.values(memories).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [memories]);

  const deleteMemory = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await MemoryStateStore.getState().deleteMemory(id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAllMemories = useCallback(async () => {
    setIsLoading(true);
    try {
      await MemoryStateStore.getState().clearAllMemories();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMemoryCount = useCallback(() => {
    return MemoryStateStore.getState().getMemoryCount();
  }, []);

  const addMemory = useCallback(async (text: string, createdAt?: number) => {
    setIsLoading(true);
    try {
      await MemoryStateStore.getState().saveMemory(text, { createdAt });
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const editMemory = useCallback(async (id: string, newText: string, createdAt: number) => {
    setIsLoading(true);
    try {
      // First delete the old memory
      await MemoryStateStore.getState().deleteMemory(id);
      // Then create a new one with the same creation time
      await MemoryStateStore.getState().saveMemory(newText, { createdAt });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    memories: getAllMemories(),
    deleteMemory,
    clearAllMemories,
    getMemoryCount,
    isLoading,
    addMemory,
    editMemory,
  };
}
