import { Artifact } from '@/artifacts/types';
import { useLanguage } from '@/hooks/use-language';
import { SheetContent } from './components/sheet-content';
import { createUndoAction } from './actions/undo';
import { createRedoAction } from './actions/redo';
import { createCopyAction } from './actions/copy';
import { createFormatToolbarItem } from './toolbar/format';
import { createAnalyzeToolbarItem } from './toolbar/analyze';

type Metadata = any;

const { t } = useLanguage();

export const sheetArtifact = new Artifact<'sheet', Metadata>({
  kind: 'sheet',
  description: t('artifact.sheet.description'),
  initialize: async () => {},
  content: SheetContent,
  actions: [createUndoAction(), createRedoAction(), createCopyAction()],
  toolbar: [createFormatToolbarItem(), createAnalyzeToolbarItem()],
});

export { generateSheetContent } from './generator';
export { updateSheetContent } from './updater';
