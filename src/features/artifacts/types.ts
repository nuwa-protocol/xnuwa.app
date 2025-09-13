import type * as Y from 'yjs';

export type ArtifactSource = {
  id: string;
  url: string;
};

export interface Artifact {
  id: string;
  title: string;
  source: ArtifactSource;
  state: Y.Doc;
  createdAt: number;
  updatedAt: number;
}
