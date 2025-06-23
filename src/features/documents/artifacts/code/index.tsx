import { Artifact } from '../types';
import { CodeContent } from './components/code-content';
import type { ConsoleOutput } from './components/console';
import { createRunCodeAction } from './actions/run-code';
import { createUndoAction } from './actions/undo';
import { createRedoAction } from './actions/redo';
import { createCopyAction } from './actions/copy';
import { createCommentsToolbarItem } from './toolbar/comments';
import { createLogsToolbarItem } from './toolbar/logs';

// export functions for external use
export { generateCodeContent } from './generator';
export { updateCodeContent } from './updater';

import { useLanguage } from '@/hooks/use-language';

interface Metadata {
  outputs: Array<ConsoleOutput>;
}

const { t } = useLanguage();

export const codeArtifact = new Artifact<'code', Metadata>({
  kind: 'code',
  description: t('artifact.code.description'),
  initialize: async ({ setMetadata }) => {
    setMetadata({ outputs: [] });
  },
  content: CodeContent,
  actions: [
    createRunCodeAction(),
    createUndoAction(),
    createRedoAction(),
    createCopyAction(),
  ],
  toolbar: [createCommentsToolbarItem(), createLogsToolbarItem()],
});
