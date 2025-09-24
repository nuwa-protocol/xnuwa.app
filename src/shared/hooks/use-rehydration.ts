import { useEffect, useState } from 'react';

type RehydrationStatus = Record<string, boolean>;

class RehydrationTracker {
  private stores: RehydrationStatus = {};
  private listeners: Set<() => void> = new Set();

  registerStore(storeName: string) {
    this.stores[storeName] = false;
    this.notifyListeners();
  }

  markRehydrated(storeName: string) {
    this.stores[storeName] = true;
    this.notifyListeners();
  }

  isAllRehydrated(): boolean {
    const storeNames = Object.keys(this.stores);
    // 如果没有注册任何store，则认为已经完成rehydration
    if (storeNames.length === 0) {
      return true;
    }
    return storeNames.every((name) => this.stores[name]);
  }

  subscribe(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => {
      callback();
    });
  }

  getStatus() {
    return { ...this.stores };
  }
}

export const rehydrationTracker = new RehydrationTracker();

export function useRehydration() {
  const [isAllRehydrated, setIsAllRehydrated] = useState(false);

  useEffect(() => {
    const checkRehydration = () => {
      setIsAllRehydrated(rehydrationTracker.isAllRehydrated());
    };

    checkRehydration();
    const unsubscribe = rehydrationTracker.subscribe(checkRehydration);

    return () => {
      unsubscribe();
    };
  }, []);

  return isAllRehydrated;
}
