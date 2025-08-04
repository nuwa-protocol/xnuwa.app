import { CurrentCapStore } from '@/shared/stores/current-cap-store';

export const useCurrentCap = () => {
  const currentCap = CurrentCapStore((state) => state.currentCap);
  const setCurrentCap = CurrentCapStore((state) => state.setCurrentCap);
  const clearCurrentCap = CurrentCapStore((state) => state.clearCurrentCap);

  return {
    currentCap,
    setCurrentCap,
    clearCurrentCap,
  };
};
