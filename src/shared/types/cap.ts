import { z } from 'zod';

// Zod schemas as single source of truth
export const CapMcpServerConfigSchema = z.object({
  url: z.string(),
  transport: z.enum(['httpStream', 'sse']),
});

export const CapModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  providerName: z.string(),
  providerSlug: z.string(),
  description: z.string(),
  context_length: z.number(),
  pricing: z.object({
    input_per_million_tokens: z.number(),
    output_per_million_tokens: z.number(),
    request_per_k_requests: z.number(),
    image_per_k_images: z.number(),
    web_search_per_k_searches: z.number(),
  }),
  supported_inputs: z.array(z.string()),
  supported_parameters: z.array(z.string()),
});

export const CapPromptSchema = z.object({
  value: z.string(),
  suggestions: z.array(z.string()).optional(),
});

export const CapIDSchema = z.object({
  id: z.string(),
  authorDID: z.string(),
  idName: z.string(),
});

export const CapCoreSchema = z.object({
  prompt: CapPromptSchema,
  model: CapModelSchema,
  mcpServers: z.record(z.string(), CapMcpServerConfigSchema),
});

export const CapMetadataSchema = z.object({
  displayName: z.string(),
  description: z.string(),
  author: z.string(),
  tags: z.array(z.string()),
  submittedAt: z.number(),
  homepage: z.string().optional(),
  repository: z.string().optional(),
  thumbnail: z.string().optional(),
});

export const CapSchema = CapIDSchema.extend({
  core: CapCoreSchema,
  metadata: CapMetadataSchema,
});

// Inferred TypeScript types from Zod schemas
export type CapMcpServerConfig = z.infer<typeof CapMcpServerConfigSchema>;
export type CapModel = z.infer<typeof CapModelSchema>;
export type CapPrompt = z.infer<typeof CapPromptSchema>;
export type CapID = z.infer<typeof CapIDSchema>;
export type CapCore = z.infer<typeof CapCoreSchema>;
export type CapMetadata = z.infer<typeof CapMetadataSchema>;
export type Cap = z.infer<typeof CapSchema>;
