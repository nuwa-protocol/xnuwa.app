import type { RemoteCap } from './types';
import type { CapStats } from '@/shared/types';
import {
  EIP8004_REGISTRATION_V1,
  type Agent8004,
  type ErrorAgent8004,
  Agent8004EndpointSchema,
  type Agent8004Endpoint,
} from '@/shared/types/8004-agent';
import {
  getOwnerAddressesByAgentIds,
  DEFAULT_IDENTITY_REGISTRY_ADDRESS,
} from './8004-service';

// Simple slugifier for idName (lowercase, [a-z0-9_], min length 6)
const toIdName = (name: string | undefined): string => {
  const base = (name || 'agent').toLowerCase().replace(/[^a-z0-9_]+/g, '_');
  const trimmed = base.replace(/^_+|_+$/g, '').slice(0, 20) || 'agent';
  return trimmed.length >= 6 ? trimmed : `${trimmed}${'_'.repeat(6 - trimmed.length)}`;
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
    for (const t of agent.supportedTrust as string[]) if (typeof t === 'string') tags.add(t);
  }
  if (Array.isArray(agent.endpoints)) {
    for (const e of agent.endpoints as any[]) if (e?.name) tags.add(String(e.name));
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
};

// Map Agent8004 (or partial/error variant) to a RemoteCap used by Cap Store UI
export const agent8004ToRemoteCap = (
  agent: Agent8004 | ErrorAgent8004,
  opts: AgentToRemoteCapOptions,
): RemoteCap => {
  const md = pickMetadataEndpoint(agent);
  const authorDID = opts.authorDID;
  const idName = opts.idName || toIdName(agent.name);
  const id = `${authorDID}:${idName}`;
  const cid = opts.cid ?? '';
  const version = opts.version ?? '1.0.0';
  const tags = Array.from(new Set([...(opts.extraTags || []), ...buildTags(agent)]));

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
  if (typeof opts.contextLength === 'number') llm.contextLength = opts.contextLength;
  if (Array.isArray(opts.supportedInputs)) llm.supportedInputs = opts.supportedInputs;
  if (opts.parameters) llm.parameters = opts.parameters;
  const llmParsed = Agent8004EndpointSchema.parse(llm);
  endpoints.push(llmParsed);

  // metadata endpoint from RemoteCap metadata
  const metadataEndpoint: any = {
    name: 'metadata',
    displayName: remote.metadata.displayName,
    homepage: remote.metadata.homepage,
    repository: remote.metadata.repository,
    suggestions: remote.metadata.introduction ? [remote.metadata.introduction] : undefined,
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

// Convenience: map a list of Agent8004s to RemoteCaps
export const agents8004ToRemoteCaps = (
  agents: Array<Agent8004 | ErrorAgent8004>,
  opts: Omit<AgentToRemoteCapOptions, 'idName'> & { idPrefix?: string },
): RemoteCap[] => {
  return agents.map((agent, i) =>
    agent8004ToRemoteCap(agent, {
      ...opts,
      idName: toIdName(agent.name || `${opts.idPrefix || 'agent'}_${i + 1}`),
    }),
  );
};

// Convenience: map agents to RemoteCaps while fetching owner addresses via multicall
export const agents8004ToRemoteCapsWithOwners = async (
  agents: Array<Agent8004 | ErrorAgent8004>,
  agentIds: number[],
  options?: Omit<AgentToRemoteCapOptions, 'authorDID' | 'idName'>,
): Promise<RemoteCap[]> => {
  // Fetch owners in the same order as agentIds
  const owners = await getOwnerAddressesByAgentIds(
    DEFAULT_IDENTITY_REGISTRY_ADDRESS,
    agentIds,
  );
  return agents.map((agent, i) => {
    const owner = owners[i] || '0x0000000000000000000000000000000000000000';
    // Use owner address directly as authorDID per requirement
    const authorDID = owner;
    const idName = toIdName(agent.name);
    return agent8004ToRemoteCap(agent, {
      ...(options || {}),
      authorDID,
      idName,
    });
  });
};
