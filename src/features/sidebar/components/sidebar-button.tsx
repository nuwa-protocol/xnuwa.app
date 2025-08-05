import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/utils';

interface SidebarButtonProps {
  icon?: LucideIcon;
  text: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  active?: boolean;
  shortcut?: string;
}

export function SidebarButton({
  icon: Icon,
  text,
  onClick,
  className,
  variant = 'secondary',
  active = false,
  shortcut,
}: SidebarButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-md text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        isPrimary && [
          'bg-gradient-to-r from-theme-primary to-theme-primary/90 hover:from-theme-primary/90 hover:to-theme-primary/80',
          'text-white shadow-lg shadow-theme-primary/25 border border-theme-primary/20 h-8 px-4',
          'justify-center relative font-medium',
          'hover:shadow-xl hover:shadow-theme-primary/30 hover:scale-[1.02]',
          'transition-all duration-200 ease-out',
        ],
        !isPrimary && [
          'justify-start py-1.5 px-2 text-sidebar-foreground',
          'hover:bg-theme-subtle hover:text-theme-primary',
          'active:bg-theme-muted',
          'transition-all duration-150 ease-out',
        ],
        active && 'bg-theme-accent text-theme-primary',
        className,
      )}
    >
      {!isPrimary && Icon && <Icon size={16} className="shrink-0" />}
      <span
        className={cn(!isPrimary && Icon && 'ml-2', isPrimary && 'font-medium')}
      >
        {text}
      </span>
      {shortcut && (
        <kbd
          className={cn(
            'text-xs font-mono px-1.5 py-0.5 rounded border transition-colors',
            isPrimary
              ? 'absolute right-2 text-white/70 bg-white/10 border-white/20 backdrop-blur-sm'
              : 'ml-auto text-sidebar-foreground/60 bg-theme-subtle border-theme-muted',
          )}
        >
          {shortcut}
        </kbd>
      )}
      {isPrimary && Icon && <Icon size={16} className="ml-2 shrink-0" />}
    </button>
  );
}
