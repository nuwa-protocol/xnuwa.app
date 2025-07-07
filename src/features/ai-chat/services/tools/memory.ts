import { tool } from 'ai';
import { z } from 'zod';
import { MemoryStateStore } from '../../stores/memory-store';

export const saveMemory = () =>
  tool({
    description:
      'Store a memory for later use. This can be used to remember important information or context. Alwasy use English for saving and retrieving memories.',
    parameters: z.object({
      memory: z.string().describe('the memory text to save'),
    }),
    execute: async ({ memory }) => {
      await MemoryStateStore.getState().saveMemory(memory);
      return memory;
    },
  });

export const queryMemory = () =>
  tool({
    description:
      'Retrieve one or more memory about the user by providing a query and an amount. Alwasy use English for saving and retrieving memories.',
    parameters: z.object({
      query: z.string().describe('the query to search for in the memory'),
      amount: z
        .number()
        .default(1)
        .describe('the number of memories to retrieve'),
    }),
    execute: async ({ query, amount }) => {
      const memories = await MemoryStateStore.getState().queryMemories(query, {
        limit: amount,
      });
      console.log()
      return memories.map((m) => ({
        text: m.text,
        createdAt: m.createdAt,
      }));
    },
  });
