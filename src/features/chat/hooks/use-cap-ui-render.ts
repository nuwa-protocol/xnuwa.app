import { useChatContext } from '../contexts/chat-context';

export const useCapUIRender = () => {
  const { append } = useChatContext();

  const handleSendPrompt = (prompt: string) => {
    append({
      role: 'user',
      content: prompt,
    });
  };

  // TODO: Implement add selection
  const handleAddSelection = (label: string, message: string) => {
    console.log('Add selection', label, message);
  };

  // TODO: Implement save state
  const handleSaveState = (state: any) => {
    console.log('Save state', state);
  };

  // TODO: Implement get state
  const handleGetState = () => {
    console.log('Get state');
  };

  return {
    handleSendPrompt,
    handleAddSelection,
    handleSaveState,
    handleGetState,
  };
};
