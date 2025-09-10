import type { RemoteCap } from './types';

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
