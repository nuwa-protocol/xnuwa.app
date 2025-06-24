// Document interface
export interface Document {
  id: string;
  did?: string;
  title: string;
  content: string | null;
  kind: "text" | "code" | "image" | "sheet";
  createdAt: number;
  updatedAt: number;
}


export interface CurrentDocumentProps {
  documentId: string;
  content: string;
  kind: "text" | "code" | "image" | "sheet";
  title: string;
  status: "streaming" | "idle" | "loading" | "error" | "success";
}