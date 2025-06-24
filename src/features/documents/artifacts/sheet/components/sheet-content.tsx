import { SpreadsheetEditor } from '@/features/documents/artifacts/sheet/components/sheet-editor';
import type { ArtifactContent } from '@/features/documents/artifacts/types';

type Metadata = any;

export function SheetContent(props: ArtifactContent<Metadata>) {
  return (
    <SpreadsheetEditor
      content={props.content}
      currentVersionIndex={props.currentVersionIndex}
      isCurrentVersion={props.isCurrentVersion}
      saveContent={props.onSaveContent}
      status={props.status}
    />
  );
}
