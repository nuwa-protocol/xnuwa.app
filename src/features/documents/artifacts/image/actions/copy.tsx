import { CopyIcon } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { toast } from '@/components/toast';
import { getLocaleText } from '@/locales/use-locale';
import type { ArtifactAction } from '../../types';

export function createCopyAction(): ArtifactAction {
  const { language, t } = useLanguage();

  return {
    icon: <CopyIcon size={18} />,
    description: t('artifact.image.actions.copy'),
    onClick: ({ content }) => {
      const { t } = getLocaleText(language);
      const img = new Image();
      img.src = `data:image/png;base64,${content}`;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
          }
        }, 'image/png');
      };
      toast({
        description: t('artifact.image.copiedImage'),
        type: 'success',
      });
    },
  };
}
