import { Editor } from '@/features/documents/artifacts/text/components/text-editor';
import type { Document } from '@/features/documents/stores';

interface TextPreviewProps {
  document: Document;
  editorStatus: 'streaming' | 'idle';
}

export function TextPreview({ document, editorStatus }: TextPreviewProps) {
  const commonProps = {
    content: document.content ?? '',
    isCurrentVersion: true,
    currentVersionIndex: 0,
    status: editorStatus,
    saveContent: () => {},
    suggestions: [],
  };

  return <Editor {...commonProps} onSaveContent={() => {}} />;
}
