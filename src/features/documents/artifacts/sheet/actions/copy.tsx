import { CopyIcon } from 'lucide-react';
import { getLocaleText } from '@/shared/locales';
import { toast } from '@/shared/components/toast';
import { parse, unparse } from 'papaparse';
import type { ArtifactAction } from '../../types';

type Metadata = any;

export function createCopyAction(): ArtifactAction<Metadata> {

  return {
    icon: <CopyIcon />,
    description: getLocaleText('en').t('artifact.sheet.actions.copy'),
    onClick: ({ content }) => {
      const parsed = parse<string[]>(content, { skipEmptyLines: true });
      const nonEmptyRows = parsed.data.filter((row) =>
        row.some((cell) => cell.trim() !== ''),
      );
      const cleanedCsv = unparse(nonEmptyRows);
      navigator.clipboard.writeText(cleanedCsv);
      toast({
        description: getLocaleText('en').t('artifact.sheet.copiedCsv'),
        type: 'success',
      });
    },
  };
}
