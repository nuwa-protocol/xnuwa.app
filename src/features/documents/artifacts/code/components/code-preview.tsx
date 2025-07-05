import type { Document } from '@/features/documents/stores';
import { CodeEditor } from './code-editor';

interface CodePreviewProps {
  document: Document;
  editorStatus: 'streaming' | 'idle';
}

export function CodePreview({ document, editorStatus }: CodePreviewProps) {
  const commonProps = {
    content: document.content ?? '',
    isCurrentVersion: true,
    currentVersionIndex: 0,
    status: editorStatus,
    saveContent: () => {},
    suggestions: [],
  };

  return (
    <div className="flex flex-1 relative w-full">
      <div className="absolute inset-0">
        <CodeEditor {...commonProps} onSaveContent={() => {}} />
      </div>
    </div>
  );
}
