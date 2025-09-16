export type ArtifactSource = {
  id: string;
  url: string;
};

export type ArtifactPaymentType = 'stream-request' | 'tool-call';

export interface ArtifactPayment {
  type: ArtifactPaymentType;
  message?: string;
  toolName?: string;
  ctxId: string;
  timestamp: number;
}

export interface Artifact {
  id: string;
  title: string;
  source: ArtifactSource;
  state: any;
  createdAt: number;
  updatedAt: number;
  payments: ArtifactPayment[];
}
