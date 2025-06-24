import type { ArtifactContent } from '@/features/documents/artifacts/types';
import { ImageEditor } from './image-editor';

export function ImageContent(props: ArtifactContent) {
  return <ImageEditor {...props} />;
}
