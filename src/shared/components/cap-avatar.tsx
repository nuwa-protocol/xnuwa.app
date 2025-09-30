import type React from 'react';
import { useTheme } from '@/shared/components/theme-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui';
import type { CapThumbnail } from '@/shared/types';

const sizeClasses = {
  sm: 'size-2', // 8px
  md: 'size-6', // 16px
  lg: 'size-6', // 24px
  xl: 'size-8', // 32px
  '2xl': 'size-10', // 96px
  '3xl': 'size-12', // 48px
  '4xl': 'size-14', // 160px
  '5xl': 'size-16', // 64px
  '6xl': 'size-120', // 72px
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
  const initial = (capName || 'Cap').trim().charAt(0).toUpperCase();
  const { resolvedTheme } = useTheme();

  // Map avatar visual size to a sensible text size for the fallback initial
  const textSizeMap: Record<keyof typeof sizeClasses, string> = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-[12px]',
    xl: 'text-[14px]',
    '2xl': 'text-[16px]',
    '3xl': 'text-[18px]',
    '4xl': 'text-[22px]',
    '5xl': 'text-[26px]',
    '6xl': 'text-[30px]',
    '7xl': 'text-[34px]',
    '8xl': 'text-[38px]',
    '9xl': 'text-[42px]',
  };
  const textSizeClass = textSizeMap[size] || 'text-base';

  // Deterministic gradient from name; tweak L/S for dark/light
  const hashString = (s: string) => {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = (h ^ s.charCodeAt(i)) * 16777619;
    return Math.abs(h);
  };
  const h = hashString(capName || 'Cap');
  const hue1 = h % 360;
  const hue2 = (hue1 + 25 + ((h >> 5) % 90)) % 360;
  const angle = 90 + (h % 180);
  const isDark = resolvedTheme === 'dark';
  const s1 = isDark ? 55 : 70;
  const l1 = isDark ? 22 : 88;
  const s2 = isDark ? 65 : 80;
  const l2 = isDark ? 28 : 78;

  const fallbackStyle: React.CSSProperties = {
    background: `linear-gradient(${angle}deg, hsl(${hue1} ${s1}% ${l1}%), hsl(${hue2} ${s2}% ${l2}%))`,
  };

  // Use Avatar to get robust image failure handling + new visual style
  return (
    <Avatar
      className={`${sizeClass} overflow-hidden dark:bg-white flex rounded-none items-center justify-center ${className || ''}`}
      aria-label={capName || 'Cap avatar'}
    >
      <AvatarImage
        src={capThumbnail || undefined}
        alt={capName || 'Cap thumbnail'}
        className="h-full w-full object-cover rounded-none"
      />
      <AvatarFallback
        className={`${textSizeClass} font-semibold uppercase leading-none rounded-none tracking-tight ${resolvedTheme === 'dark' ? 'text-white/90' : 'text-foreground'
          }`}
        style={fallbackStyle}
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
