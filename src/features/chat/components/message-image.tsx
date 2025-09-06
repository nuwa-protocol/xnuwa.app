import { DownloadIcon, ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/utils';

export type MessageImageProps = {
  imageName?: string;
  className?: string;
  alt?: string;
  base64: string;
  mediaType: string;
};

export const MessageImage = ({
  imageName,
  base64,
  mediaType,
  alt,
  className,
}: MessageImageProps) => {
  const [hasError, setHasError] = useState(false);

  const handleDownload = () => {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(base64.split(',')[1] || base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mediaType });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${imageName || 'Generated Image'}.${mediaType.split('/')[1] || 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  if (hasError) {
    return (
      <div className="w-full flex justify-center">
        <div
          className={cn(
            'flex h-48 w-48 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-gray-500',
            className,
          )}
        >
          <div className="text-center items-center justify-center flex flex-col">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
            <p className="mt-2 text-sm">
              Image generation failed, please try again
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="relative group">
        <img
          alt={alt}
          className={cn(
            'h-auto max-w-md overflow-hidden rounded-md',
            'hover:scale-105 hover:shadow-lg transition-all duration-300',
            className,
          )}
          src={base64}
          onError={(e) => {
            console.error('Error loading image', e);
            setHasError(true);
          }}
        />
        {/* Download button in top right corner */}
        <button
          type="button"
          onClick={handleDownload}
          className="absolute bottom-2 left-2 bg-black/70 text-gray-400 hover:bg-muted  hover:text-foreground p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
          title="Download image"
        >
          <DownloadIcon className="size-6" />
        </button>
      </div>
    </div>
  );
};
