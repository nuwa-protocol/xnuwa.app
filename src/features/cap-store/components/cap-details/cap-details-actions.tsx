import { PackageCheck, PackagePlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui';
import { capKitService } from '@/shared/services/capkit-service';
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
  const [isCapInstalled, setIsCapInstalled] = useState(false);
  const { fetchInstalledCaps } = InstalledCapsStore();

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      const capKit = await capKitService.getCapKit();

      try {
        const favoriteStatus = await capKit.favorite(
          capQueryData.id,
          'isFavorite',
        );
        setIsCapInstalled(favoriteStatus.data ?? false);
      } catch (error) {
        console.error('Failed to fetch installed status:', error);
      }
    };
    fetchFavoriteStatus();
  }, [capQueryData.id]);

  const handleToggleFavorite = async () => {
    if (isCapInstalled) {
      setIsUninstalling(true);
    } else {
      setIsInstalling(true);
    }

    const capKit = await capKitService.getCapKit();

    if (isCapInstalled) {
      toast.promise(capKit.favorite(capQueryData.id, 'remove'), {
        loading: 'Uninstalling...',
        success: async () => {
          setIsCapInstalled(false);
          // Refresh cached installed list after successful removal
          try {
            await fetchInstalledCaps();
          } catch {
            /* noop */
          }
          return `Removed ${capQueryData.metadata.displayName} from installed`;
        },
        error: (error) => {
          console.error('Failed to remove from installed:', error);
          return 'Failed to remove from installed. Please try again.';
        },
        finally: () => {
          setIsUninstalling(false);
        },
      });
    } else {
      toast.promise(capKit.favorite(capQueryData.id, 'add'), {
        loading: 'Installing...',
        success: async () => {
          setIsCapInstalled(true);
          // Refresh cached installed list after successful addition
          try {
            await fetchInstalledCaps();
          } catch {
            /* noop */
          }
          return `Installed ${capQueryData.metadata.displayName}`;
        },
        error: (error) => {
          console.error('Failed to install:', error);
          return 'Failed to install. Please try again.';
        },
        finally: () => {
          setIsInstalling(false);
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
                onClick={handleToggleFavorite}
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
                onClick={handleToggleFavorite}
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
