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
          'bg-white hover:bg-gray-100 shadow-sm border border-gray-200 h-8 px-4',
          'justify-center relative',
          'dark:bg-black dark:hover:bg-gray-800 dark:border-gray-700',
        ],
        !isPrimary && [
          'justify-start py-1.5 px-2 text-gray-700 hover:bg-gray-100',
          'dark:text-gray-200 dark:hover:bg-gray-800',
        ],
        active && 'bg-gray-100 dark:bg-gray-800',
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
        <kbd className={cn(
          "text-xs font-mono px-1.5 py-0.5 rounded border",
          isPrimary ? "absolute right-2 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700" : "ml-auto text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800"
        )}>
          {shortcut}
        </kbd>
      )}
      {isPrimary && Icon && <Icon size={16} className="ml-2 shrink-0" />}
    </button>
  );
}
