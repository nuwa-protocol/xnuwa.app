import { Artifact } from '@/artifacts/types';
import { useLanguage } from '@/hooks/use-language';
import { TextContent } from './components/text-content';
import { createVersionChangeAction } from './actions/version-change';
import { createUndoAction } from './actions/undo';
import { createRedoAction } from './actions/redo';
import { createCopyAction } from './actions/copy';
import { createPolishToolbarItem } from './toolbar/polish';
import { createSuggestionsToolbarItem } from './toolbar/suggestions';

const { t } = useLanguage();

export const textArtifact = new Artifact<'text'>({
  kind: 'text',
  description: t('artifact.text.description'),
  initialize: async ({ documentId, setMetadata }) => {},
  content: TextContent,
  actions: [
    createVersionChangeAction(),
    createUndoAction(),
    createRedoAction(),
    createCopyAction(),
  ],
  toolbar: [createPolishToolbarItem(), createSuggestionsToolbarItem()],
});

export { generateTextContent } from './generator';
export { updateTextContent } from './updater';
