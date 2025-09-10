import type { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/shared/utils';

interface SidebarButtonProps {
  icon?: LucideIcon;
  text: string;
  href: string;
  className?: string;
  variant?: 'primary' | 'secondary';
  shortcut?: string;
  endContent?: React.ReactNode;
}

export function SidebarButton({
  icon: Icon,
  text,
  href,
  className,
  variant = 'secondary',
  shortcut,
  endContent,
}: SidebarButtonProps) {
  const navigate = useNavigate();
  const isPrimary = variant === 'primary';
  const pathname = useLocation().pathname;
  const isActive = useMemo(() => {
    return pathname === href;
  }, [pathname, href]);

  return (
    <button
      type="button"
      onClick={() => navigate(href)}
      className={cn(
        'inline-flex items-center rounded-md text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isPrimary && [
          'bg-gradient-to-br from-theme-primary/80 via-theme-primary to-theme-primary/80 hover:from-theme-primary/90 hover:to-theme-primary/80',
          'text-white shadow-lg shadow-theme-primary/25 border border-theme-primary/20 h-10 px-4',
          'justify-center relative font-medium',
          'hover:shadow-xl hover:shadow-theme-primary/30 hover:scale-[1.02]',
          'transition-all duration-200 ease-out',
        ],
        !isPrimary && [
          'justify-start py-1.5 px-2',
          'hover:bg-sidebar-accent',
          'transition-all duration-150 ease-out',
        ],
        isActive &&
          !isPrimary &&
          'bg-sidebar-accent text-sidebar-primary font-medium',
        className,
      )}
    >
      {!isPrimary && Icon && (
        <Icon size={16} className="shrink-0 font-medium" />
      )}
      <span
        className={cn(!isPrimary && Icon && 'ml-2', isPrimary && 'font-bold')}
      >
        {text}
      </span>
      {endContent && (
        <span className={cn('ml-auto', isPrimary && 'mr-2')}>
          {endContent}
        </span>
      )}
      {shortcut && (
        <kbd
          className={cn(
            'text-xs font-mono px-1.5 py-0.5 rounded border transition-colors',
            isPrimary
              ? 'absolute right-2 text-white/90 bg-white/20 border-white/20 backdrop-blur-sm'
              : 'ml-auto text-sidebar-foreground/60 bg-theme-subtle border-theme-muted',
            endContent && !isPrimary && 'ml-2'
          )}
        >
          {shortcut}
        </kbd>
      )}
      {isPrimary && Icon && <Icon size={16} className="ml-2 shrink-0" />}
    </button>
  );
}
