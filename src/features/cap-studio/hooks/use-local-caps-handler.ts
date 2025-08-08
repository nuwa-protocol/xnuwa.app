import { CapStudioStore } from '../stores/cap-studio-stores';

export const useLocalCapsHandler = () => {
  const { createCap, updateCap, deleteCap } = CapStudioStore();

  return {
    createCap,
    updateCap,
    deleteCap,
  };
};
