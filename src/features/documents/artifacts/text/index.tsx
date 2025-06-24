import { Artifact } from '@/features/documents/artifacts/types';
import { createCopyAction } from './actions/copy';
import { createRedoAction } from './actions/redo';
import { createUndoAction } from './actions/undo';
import { createVersionChangeAction } from './actions/version-change';
import { TextContent } from './components/text-content';
import { createPolishToolbarItem } from './toolbar/polish';
import { createSuggestionsToolbarItem } from './toolbar/suggestions';

export const createTextArtifact = () => {
  return new Artifact<'text'>({
    kind: 'text',
    description: 'Text artifact for displaying and editing text',
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
};

export const textArtifact = createTextArtifact();

export { generateTextContent } from './generator';
export { updateTextContent } from './updater';
