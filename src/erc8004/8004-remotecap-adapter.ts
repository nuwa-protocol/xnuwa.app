import {
  type Agent8004,
  type Agent8004Endpoint,
  Agent8004EndpointSchema,
  EIP8004_REGISTRATION_V1,
  type ErrorAgent8004,
} from '@/erc8004/8004-agent';
import type { Cap, CapStats } from '@/shared/types';
import type { RemoteCap } from '../features/cap-store/types';

// Simple slugifier for idName (lowercase, [a-z0-9_], min length 6)
const toIdName = (name: string | undefined): string => {
  const base = (name || 'agent').toLowerCase().replace(/[^a-z0-9_]+/g, '_');
  const trimmed = base.replace(/^_+|_+$/g, '').slice(0, 20) || 'agent';
  return trimmed.length >= 6
    ? trimmed
    : `${trimmed}${'_'.repeat(6 - trimmed.length)}`;
};

const defaultStats: CapStats = {
  capId: '',
  downloads: 0,
  ratingCount: 0,
  averageRating: 0,
  favorites: 0,
};

// Extract optional metadata endpoint content
const pickMetadataEndpoint = (agent: Partial<Agent8004 | ErrorAgent8004>) => {
  const eps = Array.isArray(agent.endpoints) ? agent.endpoints : [];
  const md = eps.find((e: any) => e?.name === 'metadata') as
    | Extract<Agent8004Endpoint, { name: 'metadata' }>
    | undefined;
  return md;
};

// Helper: stringify supported trust and endpoint names into tags
const buildTags = (agent: Partial<Agent8004 | ErrorAgent8004>): string[] => {
  const tags = new Set<string>(['8004']);
  if (Array.isArray(agent.supportedTrust)) {
    for (const t of agent.supportedTrust as string[])
      if (typeof t === 'string') tags.add(t);
  }
  if (Array.isArray(agent.endpoints)) {
    for (const e of agent.endpoints as any[])
      if (e?.name) tags.add(String(e.name));
  }
  return Array.from(tags);
};

export type AgentToRemoteCapOptions = {
  authorDID: string; // required because Agent8004 doesn't carry author info
  idName?: string; // default derived from agent.name
  cid?: string; // default ''
  version?: string; // default '1.0.0'
  stats?: CapStats; // default zeros
  fallbackIntroduction?: string; // default same as description
  extraTags?: string[]; // merged into tags
  id: string;
};

// Map Agent8004 (or partial/error variant) to a RemoteCap used by Cap Store UI
export const agent8004ToRemoteCap = (
  agent: Agent8004 | ErrorAgent8004,
  opts: AgentToRemoteCapOptions,
): RemoteCap => {
  const md = pickMetadataEndpoint(agent);
  const authorDID = opts.authorDID;
  const idName = opts.idName || toIdName(agent.name);
  const id = opts.id;
  const cid = opts.cid ?? '';
  const version = opts.version ?? '1.0.0';
  const tags = Array.from(
    new Set([...(opts.extraTags || []), ...buildTags(agent)]),
  );

  // Prefer metadata endpoint displayName, then name/idName
  const displayName = md?.displayName || agent.name || idName;
  const description = agent.description || 'No description';
  const introduction = opts.fallbackIntroduction || description;
  const homepage = md?.homepage;
  const repository = md?.repository;
  const thumbnail = agent.image;

  const stats = opts.stats ?? { ...defaultStats, capId: id };

  return {
    id,
    idName,
    authorDID,
    cid,
    version,
    stats,
    metadata: {
      displayName,
      description,
      introduction,
      tags,
      homepage,
      repository,
      thumbnail,
    },
  };
};

export type AgentToCapOptions = {
  // Required because 8004 agent JSON does not include author
  authorDID: string;
  // Optional overrides
  idName?: string; // default derived from agent.name
  capId?: string; // default `${authorDID}:${idName}`
};

// Map Agent8004 (or partial/error variant) directly to a Cap object
// This is used when the user downloads/installs a Cap from a listed 8004 agent
export const agent8004ToCap = (
  agent: Agent8004 | ErrorAgent8004,
  opts: AgentToCapOptions,
): Cap => {
  const md = pickMetadataEndpoint(agent);
  // Prefer prompt endpoint's value for Cap prompt
  const promptEp = Array.isArray(agent.endpoints)
    ? ((agent.endpoints as any[]).find((e) => e?.name === 'prompt') as
        | Extract<Agent8004Endpoint, { name: 'prompt' }>
        | undefined)
    : undefined;

  const authorDID = opts.authorDID;
  const idName = opts.idName || toIdName(agent.name);
  const capId = opts.capId ?? `${authorDID}:${idName}`;

  // LLM model: pick first `llm` endpoint and map to Cap model
  const llm = Array.isArray(agent.endpoints)
    ? (agent.endpoints.find((e: any) => e?.name === 'llm') as
        | Extract<Agent8004Endpoint, { name: 'llm' }>
        | undefined)
    : undefined;

  // Safe defaults if not provided
  const providerId = (llm?.providerId as any) || 'openrouter';
  const modelId = llm?.modelId || 'unknown';
  const supportedInputs = llm?.supportedInputs || ['text'];
  const contextLength = llm?.contextLength ?? 4096;
  const customGatewayUrl = llm?.gateway;
  const parameters = llm?.parameters;

  // Collect MCP servers from mcp endpoints; fall back to a numbered name if serverName unspecified
  const mcpServers: Record<string, string> = {};
  if (Array.isArray(agent.endpoints)) {
    let unnamed = 1;
    for (const e of agent.endpoints as any[]) {
      if (e?.name === 'mcp' && typeof e.endpoint === 'string') {
        const key = e.serverName || `server${unnamed++}`;
        mcpServers[key] = e.endpoint;
      }
    }
  }

  // Optional artifact endpoint -> Cap artifact
  let artifact: Cap['core']['artifact'];
  if (Array.isArray(agent.endpoints)) {
    const art = (agent.endpoints as any[]).find((e) => e?.name === 'artifact');
    if (art?.endpoint) artifact = { srcUrl: String(art.endpoint) };
  }

  const tags = buildTags(agent);
  const displayName = md?.displayName || agent.name || idName;
  const description = agent.description || 'No description';
  const introduction = md?.suggestions?.[0] || description;
  const homepage = md?.homepage;
  const repository = md?.repository;
  const thumbnail = agent.image;

  const cap: Cap = {
    id: capId,
    authorDID,
    idName,
    core: {
      prompt: {
        value: typeof (promptEp as any)?.value === 'string' ? (promptEp as any).value : '',
        suggestions: md?.suggestions,
      },
      model: {
        providerId: providerId as any, // provider union in CapModel; default 'openrouter'
        modelId,
        supportedInputs: supportedInputs as any,
        contextLength,
        ...(customGatewayUrl ? { customGatewayUrl } : {}),
        ...(parameters ? { parameters } : {}),
      },
      mcpServers,
      artifact,
    },
    metadata: {
      displayName,
      description,
      introduction,
      tags,
      homepage,
      repository,
      thumbnail,
    },
  } as Cap;

  return cap;
};

export type RemoteCapToAgentOptions = {
  // Minimal requirement for Agent8004: must include at least one x402-LLM endpoint
  llmEndpointUrl: string; // e.g. https://gateway.example.com/llm
  // Optional details for the LLM endpoint
  modelId?: string;
  providerId?: string;
  gateway?: string;
  contextLength?: number;
  supportedInputs?: Array<'text' | 'image' | 'file' | 'audio'>;
  parameters?: Record<string, any>;
  // Additional optional endpoints
  mcpServers?: Record<string, string>; // name -> URL
  artifactUrl?: string;
  // Optional prompt content (if available when converting from a RemoteCap)
  promptValue?: string;
  // Optional trust and registrations
  supportedTrust?: string[];
  registrations?: Array<{ agentId: string; agentRegistry: string }>;
  // Display overrides
  imageUrl?: string;
  name?: string;
  description?: string;
};

// Map a RemoteCap to a minimal-valid Agent8004
export const remoteCapToAgent8004 = (
  remote: RemoteCap,
  opts: RemoteCapToAgentOptions,
): Agent8004 => {
  const endpoints: Agent8004Endpoint[] = [];

  // llm (required)
  const llm: any = {
    name: 'llm',
    endpoint: opts.llmEndpointUrl,
  };
  if (opts.gateway) llm.gateway = opts.gateway;
  if (opts.modelId) llm.modelId = opts.modelId;
  if (opts.providerId) llm.providerId = opts.providerId;
  if (typeof opts.contextLength === 'number')
    llm.contextLength = opts.contextLength;
  if (Array.isArray(opts.supportedInputs))
    llm.supportedInputs = opts.supportedInputs;
  if (opts.parameters) llm.parameters = opts.parameters;
  const llmParsed = Agent8004EndpointSchema.parse(llm);
  endpoints.push(llmParsed);

  // prompt (optional when provided)
  if (opts.promptValue && typeof opts.promptValue === 'string') {
    const promptParsed = Agent8004EndpointSchema.parse({
      name: 'prompt',
      value: opts.promptValue,
    } as any);
    endpoints.push(promptParsed);
  }

  // metadata endpoint from RemoteCap metadata
  const metadataEndpoint: any = {
    name: 'metadata',
    displayName: remote.metadata.displayName,
    homepage: remote.metadata.homepage,
    repository: remote.metadata.repository,
    suggestions: remote.metadata.introduction
      ? [remote.metadata.introduction]
      : undefined,
  };
  const mdParsed = Agent8004EndpointSchema.parse(metadataEndpoint);
  endpoints.push(mdParsed);

  // mcp (from mcpServers map)
  if (opts.mcpServers) {
    for (const [serverName, endpoint] of Object.entries(opts.mcpServers)) {
      const mcpParsed = Agent8004EndpointSchema.parse({
        name: 'mcp',
        endpoint,
        serverName,
      });
      endpoints.push(mcpParsed);
    }
  }

  // artifact
  if (opts.artifactUrl) {
    const artParsed = Agent8004EndpointSchema.parse({
      name: 'artifact',
      endpoint: opts.artifactUrl,
    });
    endpoints.push(artParsed);
  }

  return {
    type: EIP8004_REGISTRATION_V1,
    name: opts.name || remote.idName,
    description: opts.description || remote.metadata.description,
    image: opts.imageUrl || remote.metadata.thumbnail || '',
    endpoints,
    registrations: opts.registrations,
    supportedTrust: opts.supportedTrust,
  } as Agent8004; // endpoints already validated; optional arrays may be undefined
};

// Map a Cap object from Cap Studio to a minimal-valid Agent8004 JSON
// Note: because a Cap does not carry an LLM endpoint URL explicitly, we use
// `core.model.customGatewayUrl` if provided; otherwise we set a placeholder URL.
export const capToAgent8004 = (cap: Cap): Agent8004 => {
  const endpoints: Agent8004Endpoint[] = [];

  // llm (required by 8004) — pull details from cap.core.model
  const model = cap.core?.model as any;
  const llmEndpointUrl =
    model?.customGatewayUrl || 'https://gateway.example.com/llm';
  const llm: any = {
    name: 'llm',
    endpoint: llmEndpointUrl,
    providerId: model?.providerId,
    modelId: model?.modelId,
    contextLength: model?.contextLength,
    supportedInputs: model?.supportedInputs,
    parameters: model?.parameters,
  };
  const llmParsed = Agent8004EndpointSchema.parse(llm);
  endpoints.push(llmParsed);

  // prompt endpoint — carry the actual prompt value for round-trip fidelity
  const promptValue = cap.core?.prompt?.value;
  if (typeof promptValue === 'string' && promptValue.length > 0) {
    const promptEp = Agent8004EndpointSchema.parse({
      name: 'prompt',
      value: promptValue,
    } as any);
    endpoints.push(promptEp);
  }

  // metadata endpoint from Cap metadata + prompt suggestions
  const md: any = {
    name: 'metadata',
    displayName: cap.metadata?.displayName,
    homepage: cap.metadata?.homepage,
    repository: cap.metadata?.repository,
    suggestions: cap.core?.prompt?.suggestions,
  };
  const mdParsed = Agent8004EndpointSchema.parse(md);
  endpoints.push(mdParsed);

  // mcp servers -> mcp endpoints
  const mcpServers = (cap.core?.mcpServers || {}) as Record<string, string>;
  for (const [serverName, endpoint] of Object.entries(mcpServers)) {
    const mcpParsed = Agent8004EndpointSchema.parse({
      name: 'mcp',
      endpoint,
      serverName,
    });
    endpoints.push(mcpParsed);
  }

  // artifact
  const artSrc = cap.core?.artifact?.srcUrl;
  if (artSrc) {
    const artParsed = Agent8004EndpointSchema.parse({
      name: 'artifact',
      endpoint: artSrc,
    });
    endpoints.push(artParsed);
  }

  return {
    type: EIP8004_REGISTRATION_V1,
    // Prefer human-friendly display name
    name: cap.metadata?.displayName || cap.idName,
    description: cap.metadata?.description || '',
    image: cap.metadata?.thumbnail || 'https://example.com/placeholder.png',
    endpoints,
    // Optional arrays omitted by default
  } as Agent8004;
};
