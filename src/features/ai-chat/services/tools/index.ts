import { ModelStateStore } from '@/features/ai-provider/stores';
import { SettingsStateStore } from '@/features/settings/stores';
import { queryMemory, saveMemory } from '../tools/memory';

const selectedModel = ModelStateStore.getState().selectedModel;
const isDevMode = SettingsStateStore.getState().settings.devMode;

const userModeTools = {
};

const devModeTools = {
  saveMemory: saveMemory(),
  queryMemory: queryMemory(),
};

export const modelSupportTools =
  selectedModel.supported_parameters.includes('tools');
export const tools = isDevMode ? devModeTools : userModeTools;
