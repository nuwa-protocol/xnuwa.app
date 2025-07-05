import type { Document } from '@/features/documents/stores';
import { ImageEditor } from './image-editor';

interface ImagePreviewProps {
  document: Document;
  artifactStatus: 'streaming' | 'idle' | 'loading' | 'error' | 'success';
}

export function ImagePreview({ document, artifactStatus }: ImagePreviewProps) {
  return (
    <ImageEditor
      title={document.title}
      content={document.content ?? ''}
      isCurrentVersion={true}
      currentVersionIndex={0}
      status={artifactStatus}
      isInline={true}
    />
  );
}
