import { z } from 'zod';

// NOTE: TS identifiers cannot start with a number or contain spaces.
// We export `Agent8004Schema` and its inferred type `Agent8004`.
// If you prefer a different name, we can alias it in this file.

// Common enums/constants
export const EIP8004_REGISTRATION_V1 =
  'https://eips.ethereum.org/EIPS/eip-8004#registration-v1' as const;

export const SupportedInputSchema = z.enum(['text', 'image', 'file', 'audio']);

export const SupportedTrustSchema = z.enum([
  'reputation',
  'crypto-economic',
  'tee-attestation',
]);

// Endpoint: prompt
export const PromptEndpointSchema = z.object({
  name: z.literal('prompt'),
  endpoint: z.string().url(),
  version: z.string(),
});

// Endpoint: x402-LLM
export const X402LlmEndpointSchema = z.object({
  name: z.literal('llm'),
  endpoint: z.string().url(),
  gateway: z.string().optional(),
  modelId: z.string().optional(),
  providerId: z.string().optional(),
  contextLength: z.number().int().positive().optional(),
  supportedInputs: z.array(SupportedInputSchema).optional(),
  // Arbitrary parameter bag: string keys, any value
  parameters: z.record(z.string(), z.any()).optional(),
});

// Endpoint: x402-MCP
export const X402McpEndpointSchema = z.object({
  name: z.literal('mcp'),
  endpoint: z.string().url(),
  serverName: z.string().optional(),
});

// Endpoint: Artifact
export const ArtifactEndpointSchema = z.object({
  name: z.literal('artifact'),
  endpoint: z.string().url(),
});

// Endpoint: metadata (display info + suggestions)
export const MetadataEndpointSchema = z.object({
  name: z.literal('metadata'),
  displayName: z.string().optional(),
  homepage: z.string().url().optional(),
  repository: z.string().url().optional(),
  suggestions: z.array(z.string()).optional(),
});

// Union of all known endpoint shapes
export const Agent8004EndpointSchema = z.union([
  PromptEndpointSchema,
  X402LlmEndpointSchema,
  X402McpEndpointSchema,
  ArtifactEndpointSchema,
  MetadataEndpointSchema,
]);

// Registration entries
export const AgentRegistrationSchema = z.object({
  agentId: z.string(),
  agentRegistry: z.string(),
});

// Top-level 8004 agent schema
export const Agent8004Schema = z.object({
  // Required core fields
  type: z.literal(EIP8004_REGISTRATION_V1),
  name: z.string(),
  description: z.string(),
  image: z.string().url(),

  // Endpoints must include at least one LLM endpoint; others optional
  endpoints: z
    .array(Agent8004EndpointSchema)
    .refine(
      (arr) => arr.some((e: any) => e?.name === 'llm'),
      {
        message: 'Must include at least one llm endpoint',
      },
    ),

  // Optional arrays per requirements
  registrations: z.array(AgentRegistrationSchema).optional(),
  supportedTrust: z.array(SupportedTrustSchema).optional(),
});

// Inferred TS types
export type Agent8004 = z.infer<typeof Agent8004Schema>;
export type Agent8004Endpoint = z.infer<typeof Agent8004EndpointSchema>;
export type AgentRegistration = z.infer<typeof AgentRegistrationSchema>;

// Error variant: partial Agent8004 plus an error message.
export const ErrorAgent8004Schema = Agent8004Schema.partial().extend({
  error: z.string(),
});

export type ErrorAgent8004 = z.infer<typeof ErrorAgent8004Schema>;
