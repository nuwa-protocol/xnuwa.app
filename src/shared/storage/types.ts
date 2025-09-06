export interface StorageConfig {
  name: string;
  version: number;
  stores: Record<string, string>;
}

export interface PersistConfig<T> {
  name: string;
  partialize?: (state: T) => Partial<T>;
  onRehydrateStorage?: () => (state?: T | undefined) => void;
}
