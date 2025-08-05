import { CurrentCapStore } from '@/shared/stores/current-cap-store';

export const useCurrentCap = () => {
  const currentCap = CurrentCapStore((state) => state.currentCap);
  const isCurrentCapMCPInitialized = CurrentCapStore(
    (state) => state.isCurrentCapMCPInitialized,
  );
  const isCurrentCapMCPError = CurrentCapStore(
    (state) => state.isCurrentCapMCPError,
  );
  const errorMessage = CurrentCapStore((state) => state.errorMessage);
  const setCurrentCap = CurrentCapStore((state) => state.setCurrentCap);

  return {
    currentCap,
    isCurrentCapMCPInitialized,
    isCurrentCapMCPError,
    errorMessage,
    setCurrentCap,
  };
};
