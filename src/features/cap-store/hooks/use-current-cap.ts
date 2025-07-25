import { useEffect, useState } from 'react';
import { CapStateStore } from '../stores';

/**
 * Hook for managing the current active cap
 */
export const useCurrentCap = () => {
  const [state, setState] = useState(() => CapStateStore.getState());
  useEffect(() => {
    const unsubscribe = CapStateStore.subscribe((newState) => {
      setState(newState);
    });
    
    return unsubscribe;
  }, []);

   const {currentCap, setCurrentCap} = state;

  const clearCurrentCap = () => setCurrentCap(null);

  return {
    isCurrentCap: !!currentCap,
    currentCap,
    setCurrentCap,
    clearCurrentCap,
  };
}; 