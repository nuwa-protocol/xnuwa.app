import type React from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
} from '@/shared/components/ui';
import { cn } from '@/shared/utils';

interface AvatarCardProps {
  title: string;
  description: string;
  avatarUrl: string | null;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => void;
  onUploadClick: () => void;
  uploadLabel: string;
  removeLabel: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  fileTypesHint?: string;
  fallbackUrl?: string;
  className?: string;
}

export function AvatarCard({
  title,
  description,
  avatarUrl,
  onAvatarChange,
  onRemoveAvatar,
  onUploadClick,
  uploadLabel,
  removeLabel,
  fileInputRef,
  fileTypesHint,
  fallbackUrl,
  className,
}: AvatarCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-8 p-6 border rounded-lg bg-background shadow-sm',
        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-base font-semibold mb-1">{title}</div>
        <div className="text-muted-foreground text-sm">{description}</div>
      </div>
      <div className="shrink-0">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Profile" />
              ) : (
                <AvatarFallback asChild>
                  {fallbackUrl ? (
                    <AvatarImage src={fallbackUrl} alt="Avatar" />
                  ) : (
                    <span>?</span>
                  )}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                className="hidden"
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onUploadClick}>
                  {uploadLabel}
                </Button>
                {avatarUrl && (
                  <Button variant="outline" size="sm" onClick={onRemoveAvatar}>
                    {removeLabel}
                  </Button>
                )}
              </div>
              {fileTypesHint && (
                <p className="text-xs text-muted-foreground">{fileTypesHint}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
