import { Editor } from '@/artifacts/text/components/text-editor';
import type { Document } from '@/stores/document-store';

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
