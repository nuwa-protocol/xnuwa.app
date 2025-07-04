import { ModelStateStore } from '../stores';

export function useSelectedModel() {
  const selectedModel = ModelStateStore((state) => state.selectedModel);
  const setSelectedModel = ModelStateStore((state) => state.setSelectedModel);

  return {
    selectedModel,
    setSelectedModel,
  };
}
