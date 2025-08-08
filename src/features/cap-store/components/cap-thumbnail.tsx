import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui';
import type { Cap } from '@/shared/types';

const sizeClasses = {
  sm: 'size-6', // 24px
  md: 'size-8', // 32px
  lg: 'size-10', // 40px
  xl: 'size-12', // 48px
} as const;

export function CapThumbnail({
  cap,
  size = 'md',
}: {
  cap: Cap;
  size?: keyof typeof sizeClasses;
}) {
  const sizeClass = sizeClasses[size] || sizeClasses['md'];

  return (
    <Avatar className={`${sizeClass} shrink-0 rounded-xl`}>
      <AvatarImage
        src={
          cap.metadata.thumbnail?.type === 'file'
            ? cap.metadata.thumbnail.file
            : cap.metadata.thumbnail?.url ||
              `https://avatar.vercel.sh/${cap.id}`
        }
        alt={cap.id}
        className="object-cover"
      />
      <AvatarFallback className="text-xs">
        {cap.idName.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
