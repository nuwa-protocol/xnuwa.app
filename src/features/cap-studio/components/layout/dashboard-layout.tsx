import type { ReactNode } from 'react';
import { cn } from '@/shared/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

export function DashboardLayout({ children, className }: DashboardLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-background via-background to-muted/20',
        className,
      )}
    >
      <div className="max-w-4xl mx-auto py-8 px-8 space-y-8">{children}</div>
    </div>
  );
}

interface DashboardHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function DashboardHeader({
  title,
  description,
  actions,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center space-x-2">{actions}</div>}
    </div>
  );
}

interface DashboardSectionProps {
  children: ReactNode;
  className?: string;
}

export function DashboardSection({
  children,
  className,
}: DashboardSectionProps) {
  return <section className={cn('space-y-6', className)}>{children}</section>;
}

interface DashboardGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  className?: string;
}

export function DashboardGrid({
  children,
  cols = 2,
  className,
}: DashboardGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', gridClasses[cols], className)}>
      {children}
    </div>
  );
}
