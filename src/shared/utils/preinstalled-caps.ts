import { parseYaml } from '@/features/cap-studio/utils/yaml';
import type { Cap } from '@/shared/types';
import { CapSchema } from '@/shared/types';

const DEFAULT_AUTHOR_DID = 'did::preinstalled';

const files = import.meta.glob<string>('../../../cap-registry/*.{yaml,yml}', {
  as: 'raw',
  eager: true,
});

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

    const cap = CapSchema.parse({
      ...parsed,
      authorDID: DEFAULT_AUTHOR_DID,
      id:
        typeof parsed.id === 'string' && parsed.id.length > 0
          ? parsed.id
          : `${DEFAULT_AUTHOR_DID}:${idName}`,
    });

    return cap;
  } catch (error) {
    console.error(`[preinstalled-caps] Failed to parse ${sourcePath}:`, error);
    return null;
  }
};

export const preinstalledCaps = Object.entries(files)
  .map(([path, content]) => toCap(content, path))
  .filter((cap): cap is Cap => Boolean(cap));
