import { useCallback } from 'react';
import { FileStateStore } from '@/stores/file-store';
import { useLanguage } from './use-language';

const { t } = useLanguage();

// File management hook
export const useFiles = () => {
  const store = FileStateStore();

  const storeFile = useCallback(async (file: File) => {
    return await store.storeFile(file);
  }, []);

  const deleteFile = useCallback(async (id: string) => {
    await store.deleteFile(id);
  }, []);

  const getFileURL = useCallback(async (id: string) => {
    return await store.getFileURL(id);
  }, []);

  const getFileBlob = useCallback(async (id: string) => {
    return await store.getFileBlob(id);
  }, []);

  const clearAllFiles = useCallback(async () => {
    await store.clearAllFiles();
  }, []);

  const validateFile = useCallback((file: File) => {
    return store.validateFile(file);
  }, []);

  const getFilesByType = useCallback((type: string) => {
    return store.getFilesByType(type);
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      // validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid file');
      }

      // store file
      const storedFile = await storeFile(file);

      // get file url
      const url = await getFileURL(storedFile.id);

      if (!url) {
        throw new Error(t('upload.failedCreateUrl'));
      }

      return {
        url,
        name: storedFile.name,
        contentType: storedFile.type,
      };
    },
    [validateFile, storeFile, getFileURL, t],
  );

  return {
    files: store.getAllFiles(),
    filesMap: store.files,
    totalSize: store.getTotalSize(),
    storeFile,
    deleteFile,
    getFileURL,
    getFileBlob,
    clearAllFiles,
    validateFile,
    getFilesByType,
    getFile: store.getFile,
    uploadFile,
  };
};
