import { SpreadsheetEditor } from '@/features/documents/artifacts/sheet/components/sheet-editor';
import type { Document } from '@/features/documents/stores';

interface SheetPreviewProps {
  document: Document;
  editorStatus: 'streaming' | 'idle';
}

export function SheetPreview({ document, editorStatus }: SheetPreviewProps) {
  const commonProps = {
    content: document.content ?? '',
    isCurrentVersion: true,
    currentVersionIndex: 0,
    status: editorStatus,
    saveContent: () => {},
    suggestions: [],
  };

  return (
    <div className="flex flex-1 relative size-full p-4">
      <div className="absolute inset-0">
        <SpreadsheetEditor {...commonProps} />
      </div>
    </div>
  );
}
