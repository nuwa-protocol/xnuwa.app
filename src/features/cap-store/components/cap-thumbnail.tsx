import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui';
import type { Cap } from '@/shared/types';

export function CapThumbnail({
  cap,
  size = '10',
}: {
  cap: Cap;
  size?: string;
}) {
  return (
    <Avatar className={`size-${size} shrink-0 rounded-md`}>
      <AvatarImage
        src={cap.metadata.thumbnail || `https://avatar.vercel.sh/${cap.idName}`}
        alt={cap.idName}
      />
      <AvatarFallback>{cap.idName.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
