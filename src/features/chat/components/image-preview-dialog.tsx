import { XIcon } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/shared/utils';

export interface ImagePreviewDialogProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
  alt?: string;
  className?: string;
}

export const ImagePreviewDialog = ({
  imageUrl,
  isOpen,
  onClose,
  alt = 'Preview image',
  className,
}: ImagePreviewDialogProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        role="presentation"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <img
          src={imageUrl}
          alt={alt}
          className={cn(
            'max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl',
            className,
          )}
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          aria-label="Close image preview"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
