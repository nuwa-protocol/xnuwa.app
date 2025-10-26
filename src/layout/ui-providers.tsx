import { Toaster } from 'sonner';
import { ThemeProvider } from '@/shared/components/theme-provider';
import { TooltipProvider } from '@/shared/components/ui/tooltip';

export function UiProviders({ children }: { children: React.ReactNode }) {
  // Common UI-scoped providers used across both public and protected areas
  return (
    <ThemeProvider>
      <TooltipProvider delayDuration={0}>
        <Toaster position="top-center" expand={true} richColors />
        {children}
      </TooltipProvider>
    </ThemeProvider>
  );
}
