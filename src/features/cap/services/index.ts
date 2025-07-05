// Export types and functions from cap-fetch

// Export types and store from cap-store
export type { InstalledCap } from '@/features/cap/stores';
export { CapStateStore } from '@/features/cap/stores';
export type {
  CapSearchFilters,
  CapSearchResponse,
  RemoteCap,
} from './cap-fetch';
export {
  checkForCapUpdates,
  getCapCategories,
  getCapsByCategory,
  getCapUpdateInfo,
  getFeaturedCaps,
  getRemoteCap,
  searchRemoteCaps,
  updateCapToLatestVersion,
} from './cap-fetch';
