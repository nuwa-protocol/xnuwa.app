// Export types and functions from cap-fetch
export type {
  RemoteCap,
  CapSearchFilters,
  CapSearchResponse,
} from './cap-fetch';

export {
  searchRemoteCaps,
  getRemoteCap,
  getCapsByCategory,
  getFeaturedCaps,
  getCapCategories,
  updateCapToLatestVersion,
  checkForCapUpdates,
  getCapUpdateInfo,
} from './cap-fetch';

// Export types and store from cap-store
export type { InstalledCap } from '@/features/cap/stores';
export { CapStateStore } from '@/features/cap/stores';
