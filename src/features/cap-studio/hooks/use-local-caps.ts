import { CapStudioStore } from "../stores/cap-studio-stores";

export const useLocalCaps = () => {
  return CapStudioStore((state) => state.localCaps);
};