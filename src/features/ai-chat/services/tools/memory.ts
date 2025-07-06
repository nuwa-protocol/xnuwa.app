import { tool } from 'ai';
import { z } from 'zod';
import { memoryDB } from './memory-db';

export const saveMemory = () =>
  tool({
    description:
      'Store a memory for later use. This can be used to remember important information or context. Alwasy use English for saving and retrieving memories.',
    parameters: z.object({
      memory: z.string().describe('the memory text to save'),
    }),
    execute: async ({ memory }) => {
      await memoryDB.insert({ text: memory });
      return null;
    },
  });

export const queryMemory = () =>
  tool({
    description:
      'Retrieve one or more memory about the user by providing a query and an amount. Alwasy use English for saving and retrieving memories.',
    parameters: z.object({
      query: z.string().describe('the memory text to save'),
      amount: z
        .number()
        .default(1)
        .describe('the number of memories to retrieve'),
    }),
    execute: async ({ query, amount }) => {
      const context = await memoryDB.query(query, { limit: amount });
      return context;
    },
  });
