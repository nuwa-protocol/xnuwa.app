'use client';
import { cn } from '@/utils';
import { memo, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FileIcon, FullscreenIcon, ImageIcon, LoaderIcon } from 'lucide-react';
import equal from 'fast-deep-equal';

import { DocumentToolCall } from './document-preview-call';
import { DocumentToolResult } from './document-preview-result';
import { TextPreview } from '@/artifacts/text/components/text-preview';
import { CodePreview } from '@/artifacts/code/components/code-preview';
import { SheetPreview } from '@/artifacts/sheet/components/sheet-preview';
import { ImagePreview } from '@/artifacts/image/components/image-preview';

import type { Document, CurrentDocumentProps } from '@/stores/document-store';
import type { ArtifactKind } from '@/artifacts';
import { useDocuments } from '@/hooks/use-documents';
import { useCurrentDocument } from '@/hooks/use-document-current';

interface DocumentPreviewProps {
  chatId: string;
  isReadonly: boolean;
  result?: any;
  args?: any;
}

export function DocumentPreview({
  chatId,
  isReadonly,
  result,
  args,
}: DocumentPreviewProps) {
  const { currentDocument: artifact, setCurrentDocument } =
    useCurrentDocument();
  const { getDocument } = useDocuments();
  const router = useRouter();

  // Use document store instead of SWR
  const documents = useMemo(() => {
    if (result?.id) {
      const document = getDocument(result.id);
      return document ? [document] : [];
    }
    return [];
  }, [result?.id, getDocument]);

  const isDocumentsFetching = false; // No longer fetching from API

  const previewDocument = useMemo(() => documents?.[0], [documents]);
  const hitboxRef = useRef<HTMLDivElement>(null);

  if (artifact.documentId !== 'init') {
    if (result) {
      return (
        <DocumentToolResult
          chatId={chatId}
          type="create"
          result={{ id: result.id, title: result.title, kind: result.kind }}
          isReadonly={isReadonly}
        />
      );
    }

    if (args) {
      return (
        <DocumentToolCall
          chatId={chatId}
          type="create"
          args={{ title: args.title }}
          isReadonly={isReadonly}
        />
      );
    }
  }

  if (isDocumentsFetching) {
    return <LoadingSkeleton artifactKind={result.kind ?? args.kind} />;
  }

  const document: Document | null = previewDocument
    ? previewDocument
    : artifact.status === 'streaming'
      ? {
          title: artifact.title,
          kind: artifact.kind,
          content: artifact.content,
          id: artifact.documentId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
      : null;

  if (!document) return <LoadingSkeleton artifactKind={artifact.kind} />;

  return (
    <div className="relative w-full cursor-pointer">
      <HitboxLayer
        hitboxRef={hitboxRef}
        result={result}
        setCurrentDocument={setCurrentDocument}
        chatId={chatId}
      />
      <DocumentHeader
        title={document.title}
        kind={document.kind}
        isStreaming={artifact.status === 'streaming'}
      />
      <DocumentContentPreview document={document} />
    </div>
  );
}

const LoadingSkeleton = ({ artifactKind }: { artifactKind: ArtifactKind }) => (
  <div className="w-full">
    <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-center justify-between dark:bg-muted h-[57px] dark:border-zinc-700 border-b-0">
      <div className="flex flex-row items-center gap-3">
        <div className="text-muted-foreground">
          <div className="animate-pulse rounded-md size-4 bg-muted-foreground/20" />
        </div>
        <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-24" />
      </div>
      <div>
        <FullscreenIcon />
      </div>
    </div>
    {artifactKind === 'image' ? (
      <div className="overflow-y-scroll border rounded-b-2xl bg-muted border-t-0 dark:border-zinc-700">
        <div className="animate-pulse h-[257px] bg-muted-foreground/20 w-full" />
      </div>
    ) : (
      <div className="overflow-y-scroll border rounded-b-2xl p-8 pt-4 bg-muted border-t-0 dark:border-zinc-700">
        <div className="flex flex-col gap-4 w-full">
          <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-48" />
          <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-3/4" />
          <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-1/2" />
          <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-64" />
          <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-40" />
          <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-36" />
          <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-64" />
        </div>
      </div>
    )}
  </div>
);

const PureHitboxLayer = ({
  hitboxRef,
  result,
  setCurrentDocument,
  chatId,
}: {
  hitboxRef: React.RefObject<HTMLDivElement>;
  result: any;
  setCurrentDocument: (
    updaterFn:
      | CurrentDocumentProps
      | ((currentDocument: CurrentDocumentProps) => CurrentDocumentProps),
  ) => void;
  chatId: string;
}) => {
  const router = useRouter();
  const handleClick = useCallback(() => {
    setCurrentDocument((artifact) =>
      artifact.status === 'streaming'
        ? { ...artifact }
        : {
            ...artifact,
            title: result.title,
            documentId: result.id,
            kind: result.kind,
          },
    );
    router.push(`/artifact?cid=${chatId}`);
  }, [setCurrentDocument, result, chatId, router]);

  return (
    <div
      className="size-full absolute top-0 left-0 rounded-xl z-10"
      ref={hitboxRef}
      onClick={handleClick}
      role="presentation"
      aria-hidden="true"
    >
      <div className="w-full p-4 flex justify-end items-center">
        <div className="absolute right-[9px] top-[13px] p-2 hover:dark:bg-zinc-700 rounded-md hover:bg-zinc-100">
          <FullscreenIcon />
        </div>
      </div>
    </div>
  );
};

const HitboxLayer = memo(PureHitboxLayer, (prevProps, nextProps) => {
  if (!equal(prevProps.result, nextProps.result)) return false;
  return true;
});

const PureDocumentHeader = ({
  title,
  kind,
  isStreaming,
}: {
  title: string;
  kind: ArtifactKind;
  isStreaming: boolean;
}) => (
  <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-start sm:items-center justify-between dark:bg-muted border-b-0 dark:border-zinc-700">
    <div className="flex flex-row items-start sm:items-center gap-3">
      <div className="text-muted-foreground">
        {isStreaming ? (
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        ) : kind === 'image' ? (
          <ImageIcon />
        ) : (
          <FileIcon />
        )}
      </div>
      <div className="-translate-y-1 sm:translate-y-0 font-medium">{title}</div>
    </div>
    <div className="w-8" />
  </div>
);

const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) return false;
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;

  return true;
});

const DocumentContentPreview = ({ document }: { document: Document }) => {
  const { currentDocument: artifact } = useCurrentDocument();

  const containerClassName = cn(
    'h-[257px] overflow-y-scroll border rounded-b-2xl dark:bg-muted border-t-0 dark:border-zinc-700',
    {
      'p-4 sm:px-14 sm:py-16': document.kind === 'text',
      'p-0': document.kind === 'code',
    },
  );

  // Map artifact status to editor status
  const editorStatus: 'streaming' | 'idle' =
    artifact.status === 'streaming' ? 'streaming' : 'idle';

  return (
    <div className={containerClassName}>
      {document.kind === 'text' ? (
        <TextPreview document={document} editorStatus={editorStatus} />
      ) : document.kind === 'code' ? (
        <CodePreview document={document} editorStatus={editorStatus} />
      ) : document.kind === 'sheet' ? (
        <SheetPreview document={document} editorStatus={editorStatus} />
      ) : document.kind === 'image' ? (
        <ImagePreview document={document} artifactStatus={artifact.status} />
      ) : null}
    </div>
  );
};
