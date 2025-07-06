import { ModelStateStore } from '@/features/ai-provider/stores';
import { SettingsStateStore } from '@/features/settings/stores';
import { queryMemory, saveMemory } from '../tools/memory';
import { createDocument } from '../tools/create-document';
import { updateDocument } from '../tools/update-document';

const selectedModel = ModelStateStore.getState().selectedModel;
const isDevMode = SettingsStateStore.getState().settings.devMode;

const userModeTools = {
  //   createDocument: createDocument(),
  //   updateDocument: updateDocument(),
  saveMemory: saveMemory(),
  queryMemory: queryMemory(),
};

const devModeTools = {
  createDocument: createDocument(),
  updateDocument: updateDocument(),
  saveMemory: saveMemory(),
  queryMemory: queryMemory(),
};

export const modelSupportTools =
  selectedModel.supported_parameters.includes('tools');
export const tools = isDevMode ? devModeTools : userModeTools;
