export interface StorageConfig {
  name: string;
  version: number;
  stores: Record<string, string>;
}

export interface PersistConfig<T, PersistedState = Partial<T>> {
  name: string;
  partialize?: (state: T) => PersistedState;
}
