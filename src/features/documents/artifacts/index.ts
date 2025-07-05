// Export all artifact components

export { codeArtifact } from './code';
export { imageArtifact } from './image';
export { sheetArtifact } from './sheet';
export { textArtifact } from './text';

import { codeArtifact } from './code';
import { CodePreview } from './code/components/code-preview';
import { imageArtifact } from './image';
import { ImagePreview } from './image/components/image-preview';
import { sheetArtifact } from './sheet';
import { SheetPreview } from './sheet/components/sheet-preview';
// Export unified artifact definitions
import { textArtifact } from './text';
// Export artifact previews
import { TextPreview } from './text/components/text-preview';

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
