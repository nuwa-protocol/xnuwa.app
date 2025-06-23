import { memo } from 'react';
import { useRouter } from 'next/navigation';
import { CrossIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useCurrentDocument } from '@/hooks/use-document-current';

function PureArtifactCloseButton({ chatId }: { chatId: string }) {
  const { closeCurrentDocument } = useCurrentDocument();
  const router = useRouter();

  return (
    <Button
      data-testid="artifact-close-button"
      variant="outline"
      className="h-fit p-2 dark:hover:bg-zinc-700"
      onClick={() => {
        router.push(`/chat?cid=${chatId}`);
        closeCurrentDocument();
      }}
    >
      <CrossIcon size={18} />
    </Button>
  );
}

export const ArtifactCloseButton = memo(PureArtifactCloseButton, () => true);
