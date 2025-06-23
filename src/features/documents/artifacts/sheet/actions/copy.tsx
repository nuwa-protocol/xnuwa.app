import { CopyIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { toast } from '@/components/toast';
import { parse, unparse } from 'papaparse';
import type { ArtifactAction } from '../../types';

type Metadata = any;

export function createCopyAction(): ArtifactAction<Metadata> {
  const { t } = useLanguage();

  return {
    icon: <CopyIcon />,
    description: t('artifact.sheet.actions.copy'),
    onClick: ({ content }) => {
      const parsed = parse<string[]>(content, { skipEmptyLines: true });
      const nonEmptyRows = parsed.data.filter((row) =>
        row.some((cell) => cell.trim() !== ''),
      );
      const cleanedCsv = unparse(nonEmptyRows);
      navigator.clipboard.writeText(cleanedCsv);
      toast({
        description: t('artifact.sheet.copiedCsv'),
        type: 'success',
      });
    },
  };
}
