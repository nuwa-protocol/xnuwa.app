import { XIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
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

  const portalTarget = useMemo(() => {
    if (typeof document === 'undefined') return null;
    return document.body;
  }, []);

  if (!isOpen || !portalTarget) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        role="presentation"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-[101] rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        aria-label="Close image preview"
      >
        <XIcon className="h-5 w-5" />
      </button>

      <div className="relative z-10 max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <div className="relative max-w-full max-h-[90vh] overflow-hidden rounded-lg shadow-2xl bg-white dark:bg-zinc-900">
          <div
            className="pointer-events-none absolute inset-0 rounded-lg [--preview-grid-color:rgb(0_0_0/_0.15)] dark:[--preview-grid-color:rgb(255_255_255/_0.18)] [background-image:linear-gradient(90deg,var(--preview-grid-color) 1px,transparent 0),linear-gradient(180deg,var(--preview-grid-color) 1px,transparent 0)] [background-size:24px_24px] [background-position:center]"
          />
          <img
            src={imageUrl}
            alt={alt}
            className={cn(
              'relative max-w-full max-h-[90vh] object-contain',
              className,
            )}
          />
        </div>
      </div>
    </div>,
    portalTarget,
  );
};
