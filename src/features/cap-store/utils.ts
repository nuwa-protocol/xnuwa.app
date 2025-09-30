import type { Page, Result, ResultCap } from '@nuwa-ai/cap-kit';
import type { RemoteCap } from './types';

export function mapResultCapToRemoteCap(
  data: ResultCap | undefined,
): RemoteCap {
  if (!data) {
    throw new Error('Invalid cap data');
  }

  return {
    cid: data.cid,
    version: data.version,
    id: data.id,
    idName: data.name,
    stats: data.stats,
    authorDID: data.id.split(':')[0],
    metadata: {
      displayName: data.displayName,
      description: data.description,
      tags: data.tags,
      repository: data.repository,
      homepage: data.homepage,
      thumbnail: data.thumbnail,
      introduction: data.introduction,
    },
  };
}

export function mapResultToRemoteCap(
  item: Result<ResultCap> | undefined,
): RemoteCap {
  if (!item?.data) {
    throw new Error('Invalid cap data');
  }

  return mapResultCapToRemoteCap(item.data);
}

/**
 * Maps API response items to RemoteCap objects
 */
export function mapResultsToRemoteCaps(
  response: Result<Page<ResultCap>>,
): RemoteCap[] {
  return (
    response.data?.items
      ?.filter((item) => item.displayName !== 'nuwa_test')
      .map((item) => mapResultCapToRemoteCap(item)) || []
  );
}
