import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { FileIcon, MessageCircleIcon, PencilIcon } from 'lucide-react';

import { toast } from '@/components/toast';

import type { ArtifactKind } from '@/artifacts';
import { useLanguage } from '@/hooks/use-language';
import { useCurrentDocument } from '@/hooks/use-document-current';

const getActionText = (
  type: 'create' | 'update' | 'request-suggestions',
  tense: 'present' | 'past',
  t: (key: string) => string,
) => {
  switch (type) {
    case 'create':
      return tense === 'present'
        ? t('documentTool.creating')
        : t('documentTool.created');
    case 'update':
      return tense === 'present'
        ? t('documentTool.updating')
        : t('documentTool.updated');
    case 'request-suggestions':
      return tense === 'present'
        ? t('documentTool.addingSuggestions')
        : t('documentTool.addedSuggestions');
    default:
      return null;
  }
};

interface DocumentToolResultProps {
  chatId: string;
  type: 'create' | 'update' | 'request-suggestions';
  result: { id: string; title: string; kind: ArtifactKind };
  isReadonly: boolean;
}

function PureDocumentToolResult({
  chatId,
  type,
  result,
  isReadonly,
}: DocumentToolResultProps) {
  const { setCurrentDocument } = useCurrentDocument();
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <button
      type="button"
      className="bg-background cursor-pointer border py-2 px-3 rounded-xl w-fit flex flex-row gap-3 items-start"
      onClick={(event) => {
        if (isReadonly) {
          toast({
            description: t('documentTool.viewingNotSupported'),
            type: 'error',
          });
          return;
        }

        setCurrentDocument({
          documentId: result.id,
          kind: result.kind,
          content: '',
          title: result.title,
          status: 'idle',
        });
        router.push(`/artifact?cid=${chatId}`);
      }}
    >
      <div className="text-muted-foreground mt-1">
        {type === 'create' ? (
          <FileIcon />
        ) : type === 'update' ? (
          <PencilIcon />
        ) : type === 'request-suggestions' ? (
          <MessageCircleIcon />
        ) : null}
      </div>
      <div className="text-left">
        {`${getActionText(type, 'past', t)} "${result.title}"`}
      </div>
    </button>
  );
}

export const DocumentToolResult = memo(PureDocumentToolResult, () => true);
