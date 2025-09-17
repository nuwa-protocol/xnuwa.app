import { Smartphone } from 'lucide-react';
import { Button } from './ui/button';

// Full-screen blocking warning for mobile viewports (<768px).
// Renders nothing on desktop so the rest of the app can mount normally.
export function MobileWarning() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background px-6 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
        <Smartphone className="h-8 w-8 text-orange-600 dark:text-orange-400" />
      </div>
      <h1 className="text-2xl font-semibold">Desktop Only</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        This application is optimized for desktop use. Please access it from a
        desktop or laptop computer.
      </p>
      <Button asChild variant="primary" className="mt-6">
        <a href="https://nuwa.dev">Go to Nuwa AI Home</a>
      </Button>
    </div>
  );
}
