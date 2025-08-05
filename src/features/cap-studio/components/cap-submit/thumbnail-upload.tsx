import { Image as ImageIcon, Upload } from 'lucide-react';
import { useId } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/shared/components/ui';

interface ThumbnailUploadProps {
  thumbnailFile: File | null;
  onFileChange: (file: File | null) => void;
}

export function ThumbnailUpload({
  thumbnailFile,
  onFileChange,
}: ThumbnailUploadProps) {
  const thumbnailUploadId = useId();

  const handleThumbnailUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        toast.error('Thumbnail must be under 2MB');
        return;
      }
      onFileChange(file);
    }
  };

  const handleRemoveThumbnail = () => {
    onFileChange(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Thumbnail</CardTitle>
        <CardDescription>
          Upload thumbnail to represent your cap
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center space-x-4">
            {thumbnailFile ? (
              <div className="w-24 h-24 rounded-lg border overflow-hidden">
                <img
                  src={URL.createObjectURL(thumbnailFile)}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <div className="flex space-x-2">
                <Input
                  id={thumbnailUploadId}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
                <label htmlFor={thumbnailUploadId}>
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </span>
                  </Button>
                </label>
                {thumbnailFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveThumbnail}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 2MB. 400x400px. <br />
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
