import { useTheme } from '@/shared/components/theme-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui';
import type { CapThumbnail } from '@/shared/types';

const sizeClasses = {
  sm: 'size-6', // 24px
  md: 'size-8', // 32px
  lg: 'size-10', // 40px
  xl: 'size-16', // 64px
  '2xl': 'size-24', // 96px
  '3xl': 'size-32', // 128px
} as const;

export function CapAvatar({
  capName,
  capThumbnail,
  size = 'md',
  className,
}: {
  capName: string;
  capThumbnail: CapThumbnail;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  const sizeClass = sizeClasses[size] || sizeClasses['md'];

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Avatar
      className={`${sizeClass} ${isDark ? 'bg-foreground' : 'bg-background'} ${className}`}
    >
      <AvatarImage src={capThumbnail} alt={capName} className="object-cover" />
      <AvatarFallback className="text-xs rounded-none">
        {capName && capName.length > 2 ? capName.slice(0, 2).toUpperCase() : 'Unamed Cap'}
      </AvatarFallback>
    </Avatar>
  );
}
