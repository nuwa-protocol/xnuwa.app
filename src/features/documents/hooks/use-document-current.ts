import { useCallback } from 'react';
import {
  defaultEmptyDocument,
  DocumentStateStore,
} from '@/stores/document-store';
import type { CurrentDocumentProps } from '@/stores/document-store';

export const useCurrentDocument = () => {
  const store = DocumentStateStore();

  const setCurrentDocument = useCallback(
    (
      updaterFn:
        | CurrentDocumentProps
        | ((currentDocument: CurrentDocumentProps) => CurrentDocumentProps),
    ) => {
      store.setCurrentDocument(updaterFn);
    },
    [store],
  );

  const closeCurrentDocument = useCallback(() => {
    setCurrentDocument((currentDocument) =>
      currentDocument.status === 'streaming'
        ? {
            ...currentDocument,
          }
        : { ...defaultEmptyDocument, status: 'idle' },
    );
  }, [store]);

  const updateCurrentDocument = useCallback(
    (updates: Partial<CurrentDocumentProps>) => {
      store.UpdateCurrentDocument(updates);
    },
    [store],
  );

  const setMetadata = useCallback(
    (metadata: any) => {
      store.setCurrentDocumentMetadata(metadata);
    },
    [store],
  );

  const resetCurrentDocument = useCallback(() => {
    store.resetCurrentDocument();
  }, []);

  return {
    currentDocument: store.currentDocument,
    setCurrentDocument,
    updateCurrentDocument,
    metadata: store.getCurrentDocumentMetadata(),
    setMetadata,
    resetCurrentDocument,
    closeCurrentDocument,
  };
};
