export type ArtifactSource = {
  id: string;
  url: string;
};

export interface Artifact {
  id: string;
  title: string;
  source: ArtifactSource;
  state: any;
  createdAt: number;
  updatedAt: number;
}
