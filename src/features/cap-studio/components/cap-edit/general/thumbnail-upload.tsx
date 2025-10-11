import { Image as ImageIcon, Link, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/shared/components/ui';
import type { CapThumbnail } from '@/shared/types';

interface ThumbnailUploadProps {
  thumbnail: CapThumbnail;
  onThumbnailChange: (thumbnail: CapThumbnail) => void;
}

export function ThumbnailUpload({
  thumbnail,
  onThumbnailChange,
}: ThumbnailUploadProps) {
  const [inputUrl, setInputUrl] = useState(thumbnail || '');
  // Local file upload is no longer supported; users must set a URL.

  const handleUrlSubmit = () => {
    if (!inputUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(inputUrl);
    } catch {
      toast.error('Please enter a valid URL format');
      return;
    }

    onThumbnailChange(inputUrl.trim());
    toast.success('Image URL has been set');
  };

  const handleRemoveThumbnail = () => {
    onThumbnailChange(undefined);
    setInputUrl('');
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          Thumbnail
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Enter an image URL to set your Cap thumbnail
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Thumbnail Preview */}
        <div className="flex items-start gap-6">
          <div className="relative group">
            {thumbnail ? (
              <div className="w-32 h-32 rounded-xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm bg-white dark:bg-slate-800">
                <img
                  src={thumbnail}
                  alt="Thumbnail Preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={() => {
                    toast.error(
                      'Failed to load image, please check if the URL is valid',
                    );
                    onThumbnailChange(undefined);
                    setInputUrl('');
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemoveThumbnail}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <ImageIcon className="h-10 w-10 text-slate-400 dark:text-slate-500" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <div className="w-full">
              <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
                <Link className="h-4 w-4" />
                <span>Image URL</span>
              </div>
              <div className="mt-2 space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="flex-1 border-slate-300 dark:border-slate-600 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-400 dark:focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-200"
                  />
                  <Button
                    type="button"
                    onClick={handleUrlSubmit}
                    disabled={!inputUrl.trim()}
                  >
                    Set
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <p>• Supported formats: PNG, JPG, WebP, GIF</p>
              <p>• Recommended size: 400x400px or 1:1 ratio</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
