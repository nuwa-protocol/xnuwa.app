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
    console.log(`${storeName} hydration finished`);
    this.stores[storeName] = true;
    this.notifyListeners();
  }

  isAllRehydrated(): boolean {
    const storeNames = Object.keys(this.stores);
    return (
      storeNames.length > 0 && storeNames.every((name) => this.stores[name])
    );
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

export function useGlobalRehydration() {
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
