import {
  CapArtifactSchema,
  CapIDSchema,
  CapMcpServerSchema,
  CapMetadataSchema,
  CapModelSchema,
  CapPromptSchema,
} from '@nuwa-ai/cap-kit';
import { z } from 'zod';

// re-export types from @nuwa-ai/cap-kit
export type {
  CapID,
  CapMcpServer,
  CapMetadata,
  CapModel,
  CapPrompt,
  CapStats,
  CapThumbnail,
  ResultCap,
} from '@nuwa-ai/cap-kit';

// re-export schemas from @nuwa-ai/cap-kit
export {
  CapArtifactSchema,
  CapIDNameSchema,
  CapIDSchema,
  CapMcpServerSchema,
  CapMetadataSchema,
  CapModelSchema,
  CapPromptSchema,
  CapPromptSuggestionSchema,
  CapThumbnailSchema,
} from '@nuwa-ai/cap-kit';

export type CapArtifact = z.infer<typeof CapArtifactSchema>;

export const CapCoreSchema = z.object({
  prompt: CapPromptSchema,
  model: CapModelSchema,
  mcpServers: z.record(z.string(), CapMcpServerSchema),
  artifact: CapArtifactSchema.optional(),
});

export type CapCore = z.infer<typeof CapCoreSchema>;

export const CapSchema = CapIDSchema.and(
  z.object({
    core: CapCoreSchema,
    metadata: CapMetadataSchema,
  }),
);

export type Cap = z.infer<typeof CapSchema>;
