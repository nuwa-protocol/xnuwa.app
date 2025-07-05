// document-store.ts
// Store for managing documents, suggestions, and artifacts with unified storage
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NuwaIdentityKit } from '@/features/auth/services';
import { generateUUID } from '@/shared/utils';
import { createPersistConfig, db } from '@/storage';
import type { CurrentDocumentProps, Document } from '../types';

// Re-export types for convenience
export type { CurrentDocumentProps, Document } from '../types';

// ================= Constants ================= //

// Empty document
export const defaultEmptyDocument: CurrentDocumentProps = {
  documentId: 'init',
  content: '',
  kind: 'text',
  title: '',
  status: 'idle',
};

// get current DID
const getCurrentDID = async () => {
  const { getDid } = await NuwaIdentityKit();
  return await getDid();
};

// ================= Database Reference ================= //

const documentDB = db;

// ================= Store State Interface ================= //

interface DocumentStoreState {
  documents: Record<string, Document>; // all documents that are loaded into the store
  currentDocument: CurrentDocumentProps; // the current document that is being viewed
  currentDocumentMetadata: Record<string, any>; // metadata for the current document

  // Document management
  createDocument: (title: string, kind: Document['kind']) => string;
  createDocumentWithId: (
    id: string,
    title: string,
    kind: Document['kind'],
    content?: string,
  ) => void;
  addNewVersionDocument: (id: string, content: string) => void;
  getDocument: (id: string) => Document | null;
  getDocuments: (id: string) => Document[];
  updateDocument: (
    id: string,
    updates: Partial<Omit<Document, 'id' | 'createdAt'>>,
  ) => void;
  deleteDocument: (id: string) => void;
  deleteDocumentAfterTimestamp: (
    id: string,
    updates: { content: string; timestamp: number },
  ) => void;
  setDocumentContent: (id: string, content: string) => void;

  // Current document management
  setCurrentDocument: (
    updaterFn:
      | CurrentDocumentProps
      | ((currentDocument: CurrentDocumentProps) => CurrentDocumentProps),
  ) => void;
  UpdateCurrentDocument: (updates: Partial<CurrentDocumentProps>) => void;
  setCurrentDocumentMetadata: (metadata: any) => void;
  getCurrentDocumentMetadata: () => any;
  resetCurrentDocument: () => void;

  // Utility methods
  getSortedDocuments: () => Document[];
  clearAllDocuments: () => void;

  // Data persistence
  loadFromDB: () => Promise<void>;
  saveToDB: () => Promise<void>;
}

// ================= Persist Configuration ================= //

const persistConfig = createPersistConfig<DocumentStoreState>({
  name: 'document-storage',
  getCurrentDID: getCurrentDID,
  partialize: (state) => ({
    documents: state.documents,
    currentDocument: state.currentDocument,
    currentDocumentMetadata: state.currentDocumentMetadata,
  }),
  onRehydrateStorage: () => (state?: DocumentStoreState) => {
    if (state) {
      state.loadFromDB();
    }
  },
});

// ================= Store Definition ================= //

export const DocumentStateStore = create<DocumentStoreState>()(
  persist(
    (set, get) => ({
      // Store state
      documents: {},
      currentDocument: defaultEmptyDocument,
      currentDocumentMetadata: {},

      // Document creation and management
      createDocument: (title: string, kind: Document['kind']) => {
        const id = generateUUID();
        const now = Date.now();

        const newDocument: Document = {
          id,
          title,
          content: null,
          kind,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          documents: {
            ...state.documents,
            [id]: newDocument,
          },
        }));

        // save to IndexedDB asynchronously
        get().saveToDB();
        return id;
      },

      createDocumentWithId: (
        id: string,
        title: string,
        kind: Document['kind'],
        content?: string,
      ) => {
        const now = Date.now();

        const newDocument: Document = {
          id,
          title,
          content: content || null,
          kind,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          documents: {
            ...state.documents,
            [id]: newDocument,
          },
        }));

        // save to IndexedDB asynchronously
        get().saveToDB();
      },

      addNewVersionDocument: (id: string, content: string) => {
        const document = get().getDocument(id);
        if (!document) return;
        const tableId = generateUUID();

        set((state) => ({
          documents: {
            ...state.documents,
            [tableId]: {
              ...document,
              content,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          },
        }));
      },

      getDocument: (id: string) => {
        const { documents } = get();
        return documents[id] || null;
      },

      getDocuments: (id: string) => {
        const { documents } = get();
        return Object.values(documents).filter(
          (document) => document.id === id,
        );
      },

      updateDocument: (
        id: string,
        updates: Partial<Omit<Document, 'id' | 'createdAt'>>,
      ) => {
        set((state) => {
          const document = state.documents[id];
          if (!document) return state;

          const updatedDocument = {
            ...document,
            ...updates,
            updatedAt: Date.now(),
          };

          return {
            documents: {
              ...state.documents,
              [id]: updatedDocument,
            },
          };
        });

        get().saveToDB();
      },

      deleteDocumentAfterTimestamp: async (
        id: string,
        updates: { content: string; timestamp: number },
      ) => {
        set((state) => {
          const documents = state.documents;
          const newDocuments = Object.fromEntries(
            Object.entries(documents).filter(
              ([_, document]) =>
                document.id !== id || document.createdAt <= updates.timestamp,
            ),
          );
          newDocuments[id] = {
            ...state.documents[id],
            content: updates.content,
            updatedAt: Date.now(),
          };

          return {
            ...state,
            documents: newDocuments,
          };
        });

        get().saveToDB();
      },

      deleteDocument: (id: string) => {
        set((state) => {
          const { [id]: deleted, ...restDocuments } = state.documents;

          return {
            documents: restDocuments,
          };
        });

        // delete related data asynchronously
        const deleteFromDB = async () => {
          try {
            await documentDB.documents.delete(id);
          } catch (error) {
            console.error('Failed to delete from DB:', error);
          }
        };
        deleteFromDB();
      },

      setDocumentContent: (id: string, content: string) => {
        get().updateDocument(id, { content });
      },

      // Artifact management methods (merged from use-artifact.ts)
      setCurrentDocument: (
        updaterFn:
          | CurrentDocumentProps
          | ((currentDocument: CurrentDocumentProps) => CurrentDocumentProps),
      ) => {
        set((state) => {
          const newArtifact =
            typeof updaterFn === 'function'
              ? updaterFn(state.currentDocument)
              : updaterFn;

          return {
            currentDocument: newArtifact,
          };
        });
      },

      UpdateCurrentDocument: (updates: Partial<CurrentDocumentProps>) => {
        set((state) => ({
          currentDocument: {
            ...state.currentDocument,
            ...updates,
          },
        }));
      },

      setCurrentDocumentMetadata: (metadata: any) => {
        set((state) => ({
          currentDocumentMetadata: {
            ...state.currentDocumentMetadata,
            [state.currentDocument.documentId]: metadata,
          },
        }));
      },

      getCurrentDocumentMetadata: () => {
        const { currentDocumentMetadata, currentDocument } = get();
        return currentDocumentMetadata[currentDocument.documentId] || null;
      },

      resetCurrentDocument: () => {
        set({
          currentDocument: defaultEmptyDocument,
        });
      },

      getSortedDocuments: () => {
        const { documents } = get();
        return Object.values(documents).sort(
          (a, b) => b.updatedAt - a.updatedAt,
        );
      },

      clearAllDocuments: () => {
        set({
          documents: {},
        });

        // clear IndexedDB
        const clearDB = async () => {
          try {
            const currentDID = await getCurrentDID();
            if (!currentDID) return;

            await documentDB.documents.where('did').equals(currentDID).delete();
          } catch (error) {
            console.error('Failed to clear documents from DB:', error);
          }
        };
        clearDB();
      },

      loadFromDB: async () => {
        if (typeof window === 'undefined') return;

        try {
          const currentDID = await getCurrentDID();
          if (!currentDID) return;

          const documents = await documentDB.documents
            .where('did')
            .equals(currentDID)
            .toArray();

          const documentsMap: Record<string, Document> = {};

          documents.forEach((doc: Document) => {
            documentsMap[doc.id] = doc;
          });

          set((state) => ({
            documents: { ...state.documents, ...documentsMap },
          }));
        } catch (error) {
          console.error('Failed to load from DB:', error);
        }
      },

      saveToDB: async () => {
        if (typeof window === 'undefined') return;

        try {
          const { documents } = get();
          const documentsToSave = Object.values(documents);
          await documentDB.documents.bulkPut(documentsToSave);
        } catch (error) {
          console.error('Failed to save to DB:', error);
        }
      },
    }),
    persistConfig,
  ),
);
