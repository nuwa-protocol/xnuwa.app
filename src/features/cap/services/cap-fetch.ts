import { mockRemoteCaps } from './mock-remote-caps';

// Cap interface for remote caps
export interface RemoteCap {
  id: string;
  name: string;
  tag: string;
  description: string;
  downloads: number;
  version: string;
  author?: string;
  createdAt?: number;
  updatedAt?: number;
  dependencies?: string[];
  size?: number;
}

// Search filters interface
export interface CapSearchFilters {
  query?: string;
  category?: string;
  sortBy?: 'downloads' | 'rating' | 'name' | 'updated';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// API response interface
export interface CapSearchResponse {
  caps: RemoteCap[];
  total: number;
  hasMore: boolean;
  page: number;
}

// Simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Search remote caps with filters
 * TODO: Replace with actual API call when Cap indexer server is ready
 */
export async function searchRemoteCaps(
  filters: CapSearchFilters = {},
): Promise<CapSearchResponse> {
  // Simulate API delay
  await delay(300 + Math.random() * 200);

  const {
    query = '',
    category = 'all',
    sortBy = 'downloads',
    sortOrder = 'desc',
    limit = 50,
    offset = 0,
  } = filters;

  let filteredCaps = [...mockRemoteCaps];

  // Apply search query filter
  if (query.trim()) {
    const searchTerm = query.toLowerCase();
    filteredCaps = filteredCaps.filter(
      (cap) =>
        cap.name.toLowerCase().includes(searchTerm) ||
        cap.description.toLowerCase().includes(searchTerm) ||
        cap.tag.toLowerCase().includes(searchTerm) ||
        cap.author?.toLowerCase().includes(searchTerm),
    );
  }

  // Apply category filter
  if (category !== 'all') {
    filteredCaps = filteredCaps.filter((cap) => cap.tag === category);
  }

  // Apply sorting
  filteredCaps.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'downloads':
        comparison = a.downloads - b.downloads;
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'updated':
        comparison = (a.updatedAt || 0) - (b.updatedAt || 0);
        break;
      default:
        comparison = a.downloads - b.downloads;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Apply pagination
  const total = filteredCaps.length;
  const paginatedCaps = filteredCaps.slice(offset, offset + limit);
  const hasMore = offset + limit < total;
  const page = Math.floor(offset / limit) + 1;

  return {
    caps: paginatedCaps,
    total,
    hasMore,
    page,
  };
}

/**
 * Get a specific remote cap by ID
 * TODO: Replace with actual API call when Cap indexer server is ready
 */
export async function getRemoteCap(id: string): Promise<RemoteCap | null> {
  await delay(150);

  const cap = mockRemoteCaps.find((cap) => cap.id === id);
  return cap || null;
}

/**
 * Get caps by category
 * TODO: Replace with actual API call when Cap indexer server is ready
 */
export async function getCapsByCategory(
  category: string,
  limit = 20,
): Promise<RemoteCap[]> {
  await delay(200);

  if (category === 'all') {
    return mockRemoteCaps
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
  }

  return mockRemoteCaps
    .filter((cap) => cap.tag === category)
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, limit);
}

/**
 * Get featured/trending caps
 * TODO: Replace with actual API call when Cap indexer server is ready
 */
export async function getFeaturedCaps(limit = 6): Promise<RemoteCap[]> {
  await delay(180);

  // Simple trending algorithm: high rating + recent downloads
  return mockRemoteCaps.filter((cap) => cap.downloads > 500).slice(0, limit);
}

/**
 * Get available categories
 * TODO: Replace with actual API call when Cap indexer server is ready
 */
export async function getCapCategories(): Promise<string[]> {
  await delay(100);

  const categories = [...new Set(mockRemoteCaps.map((cap) => cap.tag))];
  return categories.sort();
}

/**
 * Update an installed cap to the latest version
 * TODO: Replace with actual API call when Cap indexer server is ready
 */
export async function updateCapToLatestVersion(
  capId: string,
): Promise<{ success: boolean; newVersion?: string; error?: string }> {
  await delay(200);

  try {
    // Fetch the latest version from remote
    const latestCap = await getRemoteCap(capId);

    if (!latestCap) {
      return { success: false, error: 'Cap not found in remote store' };
    }

    return {
      success: true,
      newVersion: latestCap.version,
      // Note: The actual local update would be handled by the calling component
      // using the cap store's updateInstalledCap function
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch latest version',
    };
  }
}

/**
 * Check if an installed cap has updates available
 * TODO: Replace with actual API call when Cap indexer server is ready
 */
export async function checkForCapUpdates(
  installedCaps: { id: string; version: string }[],
): Promise<
  {
    id: string;
    currentVersion: string;
    latestVersion: string;
    hasUpdate: boolean;
  }[]
> {
  await delay(300);

  const updateChecks = await Promise.all(
    installedCaps.map(async (cap) => {
      const remoteCap = await getRemoteCap(cap.id);
      const hasUpdate = remoteCap ? remoteCap.version !== cap.version : false;

      return {
        id: cap.id,
        currentVersion: cap.version,
        latestVersion: remoteCap?.version || cap.version,
        hasUpdate,
      };
    }),
  );

  return updateChecks;
}

/**
 * Get update information for a specific cap
 * TODO: Replace with actual API call when Cap indexer server is ready
 */
export async function getCapUpdateInfo(
  capId: string,
  currentVersion: string,
): Promise<{
  hasUpdate: boolean;
  latestVersion: string;
  changelog?: string;
  breaking?: boolean;
} | null> {
  await delay(150);

  const remoteCap = await getRemoteCap(capId);

  if (!remoteCap) {
    return null;
  }

  const hasUpdate = remoteCap.version !== currentVersion;

  return {
    hasUpdate,
    latestVersion: remoteCap.version,
    changelog: hasUpdate
      ? `Updated to version ${remoteCap.version}`
      : undefined,
    breaking: false, // TODO: Implement breaking change detection
  };
}
