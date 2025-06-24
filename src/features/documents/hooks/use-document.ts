'use client';

import { useCallback } from 'react';
import { DocumentStateStore, type Document } from '@/features/documents/stores';
import { useDocuments } from './use-documents';

export const useDocument = (id: string) => {
  const store = DocumentStateStore();
  const {
    updateDocument,
    deleteDocument,
    setDocumentContent,
    addNewVersion,
    deleteAfterTimestamp,
  } = useDocuments();

  const document = store.getDocument(id);

  return {
    document,
    updateDocument: useCallback(
      (updates: Partial<Omit<Document, 'id' | 'createdAt'>>) => {
        updateDocument(id, updates);
      },
      [updateDocument, id],
    ),
    setContent: useCallback(
      (content: string) => {
        setDocumentContent(id, content);
      },
      [setDocumentContent, id],
    ),
    deleteDocument: useCallback(() => {
      deleteDocument(id);
    }, [deleteDocument, id]),
    addNewVersion: useCallback(
      (content: string) => {
        addNewVersion(id, content);
      },
      [addNewVersion, id],
    ),
    deleteAfterTimestamp: useCallback(
      (updates: { content: string; timestamp: number }) => {
        deleteAfterTimestamp(id, updates);
      },
      [deleteAfterTimestamp, id],
    ),
  };
};
