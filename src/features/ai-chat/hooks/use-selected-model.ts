import { ChatStateStore } from '../stores/chat-store';

export function useSelectedModel() {
  const selectedModel = ChatStateStore((state) => state.selectedModel);
  const setSelectedModel = ChatStateStore((state) => state.setSelectedModel);

  return {
    selectedModel,
    setSelectedModel,
  };
} 