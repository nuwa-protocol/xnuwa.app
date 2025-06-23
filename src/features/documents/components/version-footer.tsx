'use client';

import { motion } from 'framer-motion';
import { useWindowSize } from 'usehooks-ts';
import { LoaderIcon } from 'lucide-react';
import type { Document } from '@/stores/document-store';
import { Button } from './ui/button';
import { useLanguage } from '@/hooks/use-language';
import { useVersionManagement } from '@/hooks/use-version-management';
import { useCurrentDocument } from '@/hooks/use-document-current';

interface VersionFooterProps {
  handleVersionChange: (type: 'next' | 'prev' | 'toggle' | 'latest') => void;
  documents: Array<Document> | undefined;
  currentVersionIndex: number;
}

export const VersionFooter = ({
  handleVersionChange,
  documents,
  currentVersionIndex,
}: VersionFooterProps) => {
  const { currentDocument: artifact } = useCurrentDocument();
  const { isMutating, restoreToVersion } = useVersionManagement();
  const { width } = useWindowSize();
  const isMobile = width < 768;
  const { t } = useLanguage();

  if (!documents) return;

  return (
    <motion.div
      className="absolute flex flex-col gap-4 lg:flex-row bottom-0 bg-background p-4 w-full border-t z-50 justify-between"
      initial={{ y: isMobile ? 200 : 77 }}
      animate={{ y: 0 }}
      exit={{ y: isMobile ? 200 : 77 }}
      transition={{ type: 'spring', stiffness: 140, damping: 20 }}
    >
      <div>
        <div>{t('version.viewingPrevious')}</div>
        <div className="text-muted-foreground text-sm">
          {t('version.restoreToEdit')}
        </div>
      </div>

      <div className="flex flex-row gap-4">
        <Button
          disabled={isMutating}
          onClick={async () => {
            await restoreToVersion(
              artifact.documentId,
              documents,
              currentVersionIndex,
              () => handleVersionChange('latest'),
            );
          }}
        >
          <div>{t('version.restore')}</div>
          {isMutating && (
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            handleVersionChange('latest');
          }}
        >
          {t('version.backToLatest')}
        </Button>
      </div>
    </motion.div>
  );
};
