// Export all artifact components
export { textArtifact } from './text';
export { codeArtifact } from './code';
export { imageArtifact } from './image';
export { sheetArtifact } from './sheet';

// Export unified artifact definitions
import { textArtifact } from './text';
import { codeArtifact } from './code';
import { imageArtifact } from './image';
import { sheetArtifact } from './sheet';

// Export artifact previews
import { TextPreview } from './text/components/text-preview';
import { SheetPreview } from './sheet/components/sheet-preview';
import { ImagePreview } from './image/components/image-preview';
import { CodePreview } from './code/components/code-preview';

export const artifactDefinitions = [
  textArtifact,
  codeArtifact,
  imageArtifact,
  sheetArtifact,
];

export type ArtifactKind = (typeof artifactDefinitions)[number]['kind'];

export const artifactPreviews = {
  text: TextPreview,
  code: CodePreview,
  image: ImagePreview,
  sheet: SheetPreview,
};
