import { type Cap, CapSchema } from '@/shared/types/cap';
import type { RemoteCap } from './types';

// Cap type guards and utility functions
export function validateCapContent(content: unknown): content is Cap {
  try {
    CapSchema.parse(content);
    return true;
  } catch {
    return false;
  }
}

export function parseCapContent(content: unknown): Cap {
  return CapSchema.parse(content);
}

/**
 * Maps API response items to RemoteCap objects
 */
export function mapToRemoteCap(items: any[]): RemoteCap[] {
  return (
    items
      ?.filter((item) => item.displayName !== 'nuwa_test')
      .map((item) => ({
        cid: item.cid,
        version: item.version,
        id: item.id,
        idName: item.name,
        stats: item.stats,
        authorDID: item.id.split(':')[0],
        metadata: {
          displayName: item.displayName,
          description: item.description,
          tags: item.tags,
          repository: item.repository,
          homepage: item.homepage,
          submittedAt: item.submittedAt,
          thumbnail: item.thumbnail,
        },
      })) || []
  );
}
