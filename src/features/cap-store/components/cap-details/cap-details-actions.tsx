import { PackageCheck, PackagePlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui';
import { InstalledCapsStore } from '@/shared/stores/installed-caps-store';
import type { RemoteCap } from '../../types';

interface CapDetailsActionsProps {
  orientation?: 'horizontal' | 'vertical';
  capQueryData: RemoteCap;
}

export function CapDetailsActions({
  orientation = 'horizontal',
  capQueryData,
}: CapDetailsActionsProps) {
  const isVertical = orientation === 'vertical';
  const [isInstalling, setIsInstalling] = useState(false);
  const [isUninstalling, setIsUninstalling] = useState(false);
  const { installedCaps, installCap, uninstallCap } = InstalledCapsStore();
  const isCapInstalled = installedCaps.some((c) => c.id === capQueryData.id);

  const handleToggleInstalled = async () => {
    if (isCapInstalled) {
      setIsUninstalling(true);
    } else {
      setIsInstalling(true);
    }

    if (isCapInstalled) {
      toast.promise(uninstallCap(capQueryData.id), {
        loading: 'Uninstalling...',
        success: `Removed ${capQueryData.metadata.displayName} from installed`,
        error: (error) => {
          console.error('Failed to remove from installed:', error);
          return 'Failed to remove from installed. Please try again.';
        }
      });
    } else {
      toast.promise(installCap(capQueryData.id), {
        loading: 'Installing...',
        success: `Installed ${capQueryData.metadata.displayName}`,
        error: (error) => {
          console.error('Failed to install:', error);
          return 'Failed to install. Please try again.';
        },
      });
    }
  };

  return (
    <TooltipProvider>
      <div className={`flex gap-3 ${isVertical ? 'flex-col' : ''}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            {isCapInstalled ? (
              <Button
                variant="outline"
                onClick={handleToggleInstalled}
                disabled={isUninstalling || isInstalling}
                className={`gap-2 group ${isVertical ? 'w-full' : ''}`}
                aria-pressed
                aria-label="Uninstall"
              >
                <PackageCheck className="h-4 w-4" />
                <span className="group-hover:hidden">Installed</span>
                <span className="hidden group-hover:inline">
                  {isUninstalling ? 'Uninstalling...' : 'Uninstall'}
                </span>
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleToggleInstalled}
                disabled={isUninstalling || isInstalling}
                className={`gap-2 ${isVertical ? 'w-full' : ''}`}
                aria-label="Install"
              >
                <PackagePlus className="h-4 w-4 text-white" />
                {isInstalling ? 'Downloading...' : 'Install'}
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent>
            {isCapInstalled ? 'Uninstall' : 'Install'}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
