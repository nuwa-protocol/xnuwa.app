import { CopyIcon } from 'lucide-react';
import { toast } from '@/shared/components/toast';
import { getLocaleText } from '@/shared/locales';
import type { ArtifactAction } from '../../types';

export function createCopyAction(): ArtifactAction {
  return {
    icon: <CopyIcon size={18} />,
    description: getLocaleText('en').t('artifact.image.actions.copy'),
    onClick: ({ content }) => {
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
        description: getLocaleText('en').t('artifact.image.copiedImage'),
        type: 'success',
      });
    },
  };
}
