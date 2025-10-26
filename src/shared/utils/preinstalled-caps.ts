import { parseYaml } from '@/features/cap-studio/utils/yaml';
import type { Cap } from '@/shared/types';
import { CapSchema } from '@/shared/types';

const DEFAULT_AUTHOR_DID = 'did::preinstalled';

const normalizeAuthorDid = (raw?: string): string => {
  if (!raw) return DEFAULT_AUTHOR_DID;
  if (raw.startsWith('did::')) return raw;
  if (raw.startsWith('did:')) return `did::${raw.slice(4)}`;
  return raw.includes('::') ? raw : `did::${raw}`;
};

const files = import.meta.glob<string>(
  '../../../pre-installed-caps/*.{yaml,yml}',
  {
    as: 'raw',
    eager: true,
  },
);

const toCap = (content: string, sourcePath: string): Cap | null => {
  try {
    const parsed = parseYaml<Record<string, unknown>>(content);

    if (!parsed || Array.isArray(parsed)) {
      throw new Error('Pre-installed cap must be a single object.');
    }

    const idName = parsed.idName;

    if (typeof idName !== 'string' || idName.length === 0) {
      throw new Error('Missing idName.');
    }

    const authorDID = normalizeAuthorDid(
      typeof parsed.authorDID === 'string' ? parsed.authorDID : undefined,
    );

    const cap = CapSchema.parse({
      ...parsed,
      authorDID,
      id:
        typeof parsed.id === 'string' && parsed.id.length > 0
          ? parsed.id
          : `${authorDID}:${idName}`,
    });

    return cap;
  } catch (error) {
    console.error(
      `[preinstalled-caps] Failed to parse ${sourcePath}:`,
      error,
    );
    return null;
  }
};

const preinstalledCaps = Object.entries(files)
  .map(([path, content]) => toCap(content, path))
  .filter((cap): cap is Cap => Boolean(cap));

const preinstalledCapIds = new Set(preinstalledCaps.map((cap) => cap.id));

export const getPreinstalledCaps = (): Cap[] => [...preinstalledCaps];

export const isPreinstalledCap = (capId: string): boolean =>
  preinstalledCapIds.has(capId);

export const mergeWithPreinstalledCaps = (caps: Cap[]): Cap[] => {
  const map = new Map<string, Cap>();
  for (const cap of preinstalledCaps) {
    map.set(cap.id, cap);
  }
  for (const cap of caps) {
    map.set(cap.id, cap);
  }
  return Array.from(map.values());
};
