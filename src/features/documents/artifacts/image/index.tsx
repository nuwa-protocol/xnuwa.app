import { Artifact } from '@/artifacts/types';
import { useLanguage } from '@/hooks/use-language';
import { ImageContent } from './components/image-content';
import { createUndoAction } from './actions/undo';
import { createRedoAction } from './actions/redo';
import { createCopyAction } from './actions/copy';

const { t } = useLanguage();

export const imageArtifact = new Artifact({
  kind: 'image',
  description: t('artifact.image.description'),
  content: ImageContent,
  actions: [createUndoAction(), createRedoAction(), createCopyAction()],
  toolbar: [],
});

export { generateImageContent } from './generator';
export { updateImageContent } from './updater';
