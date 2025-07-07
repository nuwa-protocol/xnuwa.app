import { CapStateStore } from '../stores';

/**
 * Hook for managing the current active cap
 */
export const useCurrentCap = () => {

   const {currentCap, setCurrentCap} = CapStateStore.getState();

  const clearCurrentCap = () => setCurrentCap(null);

  return {
    isCurrentCap: !!currentCap,
    currentCap,
    setCurrentCap,
    clearCurrentCap,
  };
}; 