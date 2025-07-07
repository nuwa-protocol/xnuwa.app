// memory-store.ts
// Store for managing memories with unified storage and vector search

import {
  env,
  type FeatureExtractionPipeline,
  pipeline,
} from '@xenova/transformers';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NuwaIdentityKit } from '@/features/auth/services';
import { generateUUID } from '@/shared/utils';
import { createPersistConfig, db } from '@/storage';

env.allowLocalModels = false;

// ================= Types ================= //

interface Memory {
  id: string;
  text: string;
  vector: number[];
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
}

interface QueryMemoryResult extends Memory {
  similarity: number;
}

interface QueryOptions {
  limit?: number;
}

// ================= Constants ================= //

const defaultModel = 'Xenova/all-MiniLM-L6-v2';
const pipePromise: Promise<FeatureExtractionPipeline> = pipeline(
  'feature-extraction',
  defaultModel,
);

// ================= Helper Functions ================= //

// get current DID
const getCurrentDID = async () => {
  const { getDid } = await NuwaIdentityKit();
  return await getDid();
};

// Cosine similarity function
const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
  const dotProduct = vecA.reduce(
    (sum, val, index) => sum + val * vecB[index],
    0,
  );
  const magnitudeA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

// Function to get embeddings from text using HuggingFace pipeline
const getEmbeddingFromText = async (text: string): Promise<number[]> => {
  const pipe = await pipePromise;
  const output = await pipe(text, {
    pooling: 'mean',
    normalize: true,
  });
  return Array.from(output.data);
};

// ================= Database Reference ================= //

const memoryDB = db;

// ================= Store Interface ================= //

interface MemoryStoreState {
  memories: Record<string, Memory>;

  // memory management
  saveMemory: (text: string, metadata?: Record<string, any>) => Promise<string>;
  queryMemories: (
    queryText: string,
    options?: QueryOptions,
  ) => Promise<QueryMemoryResult[]>;

  // utility methods
  clearAllMemories: () => Promise<void>;
  getMemoryCount: () => number;
  deleteMemory: (id: string) => Promise<void>;

  // data persistence
  loadFromDB: () => Promise<void>;
  saveToDB: () => Promise<void>;
}

// ================= Persist Configuration ================= //

const persistConfig = createPersistConfig<MemoryStoreState>({
  name: 'memory-storage',
  getCurrentDID: getCurrentDID,
  partialize: (state) => ({
    memories: state.memories,
  }),
  onRehydrateStorage: () => (state) => {
    if (state) {
      state.loadFromDB();
    }
  },
});

// ================= Store Factory ================= //

export const MemoryStateStore = create<MemoryStoreState>()(
  persist(
    (set, get) => ({
      memories: {},

      saveMemory: async (text: string, metadata?: Record<string, any>) => {
        try {
          // Generate embedding for the text
          const vector = await getEmbeddingFromText(text);

          const memory: Memory = {
            id: generateUUID(),
            text,
            vector,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            metadata,
          };

          // Add to store
          set((state) => ({
            memories: {
              ...state.memories,
              [memory.id]: memory,
            },
          }));

          // Save to database
          await get().saveToDB();

          return memory.id;
        } catch (error) {
          console.error('Failed to save memory:', error);
          throw error;
        }
      },

      deleteMemory: async (id: string) => {
        // Remove from store
        set((state) => {
          const { [id]: deleted, ...restMemories } = state.memories;
          return {
            memories: restMemories,
          };
        });

        // Delete from database
        try {
          const currentDID = await getCurrentDID();
          if (!currentDID) return;

          // 使用单个索引查询并过滤结果
          await memoryDB.memories
            .where('did').equals(currentDID)
            .and(item => item.id === id)
            .delete();
        } catch (error) {
          console.error('Failed to delete memory from DB:', error);
        }
      },

      queryMemories: async (
        queryText: string,
        { limit = 10 }: QueryOptions = {},
      ) => {
        try {
          // Get embedding for the query text
          const queryVector = await getEmbeddingFromText(queryText);

          const { memories } = get();
          const memoryList = Object.values(memories);

          // Calculate cosine similarity for each memory and sort by similarity
          const similarities: QueryMemoryResult[] = memoryList.map((memory) => {
            const similarity = cosineSimilarity(queryVector, memory.vector);
            return { ...memory, similarity };
          });

          // Sort by similarity (descending) and return top results
          similarities.sort((a, b) => b.similarity - a.similarity);
          return similarities.slice(0, limit);
        } catch (error) {
          console.error('Failed to query memories:', error);
          throw error;
        }
      },

      clearAllMemories: async () => {
        set({
          memories: {},
        });

        // Clear database
        try {
          const currentDID = await getCurrentDID();
          if (!currentDID) return;

          await memoryDB.memories.where('did').equals(currentDID).delete();
        } catch (error) {
          console.error('Failed to clear memories from DB:', error);
        }
      },

      getMemoryCount: () => {
        const { memories } = get();
        return Object.keys(memories).length;
      },

      loadFromDB: async () => {
        if (typeof window === 'undefined') return;

        try {
          const currentDID = await getCurrentDID();
          if (!currentDID) return;

          const memories = await memoryDB.memories
            .where('did')
            .equals(currentDID)
            .toArray();

          // Sort by updatedAt in descending order
          const sortedMemories = memories.sort(
            (a: Memory, b: Memory) => b.updatedAt - a.updatedAt,
          );

          const memoriesMap: Record<string, Memory> = {};
          sortedMemories.forEach((memory: Memory) => {
            memoriesMap[memory.id] = memory;
          });

          set((state) => ({
            memories: { ...state.memories, ...memoriesMap },
          }));
        } catch (error) {
          console.error('Failed to load memories from DB:', error);
        }
      },

      saveToDB: async () => {
        if (typeof window === 'undefined') return;

        try {
          const { memories } = get();
          const memoriesToSave = Object.values(memories);

          // Use bulkPut to efficiently update data
          await memoryDB.memories.bulkPut(memoriesToSave);
        } catch (error) {
          console.error('Failed to save memories to DB:', error);
        }
      },
    }),
    persistConfig,
  ),
);
