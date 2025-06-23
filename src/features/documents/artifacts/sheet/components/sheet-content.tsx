import type { ArtifactContent } from '@/artifacts/types';
import { SpreadsheetEditor } from '@/artifacts/sheet/components/sheet-editor';

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
