import { z } from 'zod';
import { CapIDSchema } from '@/shared/types';

export const ArtifactAuthorDIDSchema = z.string().startsWith('did::');
export const ArtifactIDNameSchema = z
  .string()
  .regex(
    /^[a-z0-9_]+$/,
    'Name must contain only lowercase letters, numbers, and underscores',
  )
  .min(6, 'Name must be at least 6 characters')
  .max(20, 'Name must be at most 20 characters');

export const ArtifactIDSchema = z
  .object({
    authorDID: ArtifactAuthorDIDSchema,
    idName: ArtifactIDNameSchema,
  })
  .transform((data) => ({
    ...data,
    id: `${data.authorDID}:${data.idName}`,
  }));

export const ArtifactPromptSuggestionSchema = z
  .string()
  .max(50, 'Each suggestion must be at most 50 characters');

export const ArtifactPromptSchema = z.object({
  value: z.string(),
  suggestions: z.array(ArtifactPromptSuggestionSchema).optional(),
});

export const ArtifactSourceSchema = z.string().url('Must be a valid URL');

export const ArtifactCoreSchema = z.object({
  prompt: ArtifactPromptSchema,
  source: ArtifactSourceSchema,
  recomendedCaps: z.array(CapIDSchema),
});

export const ArtifactThumbnailSchema = z.string().optional();

export const ArtifactMetadataSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(50, 'Display name too long'),
  description: z
    .string()
    .min(20, 'Description must be at least 10 characters')
    .max(500, 'Description too long'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  homepage: z.string().url('Must be a valid URL').optional(),
  repository: z.string().url('Must be a valid URL').optional(),
  thumbnail: ArtifactThumbnailSchema,
});

export const ArtifactSchema = ArtifactIDSchema.and(
  z.object({
    core: ArtifactCoreSchema,
    metadata: ArtifactMetadataSchema,
  }),
);

export type Artifact = z.infer<typeof ArtifactSchema>;

export type ArtifactPaymentType = 'stream-request' | 'tool-call';

export interface ArtifactPayment {
  type: ArtifactPaymentType;
  message?: string;
  toolName?: string;
  ctxId: string;
  timestamp: number;
}

export interface ArtifactSession {
  id: string;
  title: string;
  artifact: Artifact;
  state: any;
  createdAt: number;
  updatedAt: number;
  payments: ArtifactPayment[];
}
