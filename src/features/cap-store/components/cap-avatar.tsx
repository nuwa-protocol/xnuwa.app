import { useTheme } from '@/shared/components/theme-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui';
import type { CapThumbnail } from '@/shared/types';

const sizeClasses = {
  sm: 'size-2', // 8px
  md: 'size-4', // 16px
  lg: 'size-6', // 24px
  xl: 'size-8', // 32px
  '2xl': 'size-10', // 96px
  '3xl': 'size-12', // 48px
  '4xl': 'size-14', // 160px
  '5xl': 'size-16', // 64px
  '6xl': 'size-18', // 72px
  '7xl': 'size-20', // 80px
  '8xl': 'size-22', // 88px
  '9xl': 'size-24', // 96px
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
        {capName && capName.length > 2
          ? capName.slice(0, 2).toUpperCase()
          : 'Unamed Cap'}
      </AvatarFallback>
    </Avatar>
  );
}
