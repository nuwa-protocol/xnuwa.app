'use client';

import { useCallback } from 'react';
import { FileStateStore } from '@/features/ai-chat/stores';

// Individual file hook
export const useFile = (id: string) => {
  const store = FileStateStore();
  const file = store.getFile(id);

  const deleteFile = useCallback(async () => {
    await store.deleteFile(id);
  }, [id]);

  const getFileURL = useCallback(async () => {
    return await store.getFileURL(id);
  }, [id]);

  const getFileBlob = useCallback(async () => {
    return await store.getFileBlob(id);
  }, [id]);

  return {
    file,
    deleteFile,
    getFileURL,
    getFileBlob,
  };
};
