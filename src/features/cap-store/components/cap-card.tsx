import { Loader2, Play, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks/use-language';
import type { Cap } from '@/shared/types/cap';
import { useInstalledCap } from '../hooks/use-installed-cap';
import { CapThumbnail } from './cap-thumbnail';

export interface CapCardProps {
  cap: Cap;
  onRun?: (cap: Cap) => void;
}

export function CapCard({ cap, onRun }: CapCardProps) {
  const { installCap, uninstallCap, updateInstalledCap, isInstalled } =
    useInstalledCap(cap);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleInstall = async () => {
    setIsLoading(true);
    try {
      installCap(cap);
      toast.success(`${cap.metadata.displayName} has been installed`);
    } catch (error) {
      toast.error(t('capStore.card.installFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUninstall = async () => {
    setIsLoading(true);
    try {
      uninstallCap(cap.id);
      toast.success(`${cap.metadata.displayName} has been uninstalled`);
    } catch (error) {
      toast.error(t('capStore.card.uninstallFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRun = () => {
    onRun?.(cap);
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <CapThumbnail cap={cap} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-sm truncate">
              {cap.metadata.displayName}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {cap.metadata.description}
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div>
              {isInstalled ? (
                <Button
                  size="sm"
                  variant="default"
                  className="text-xs px-2 py-1 h-6"
                  onClick={handleRun}
                >
                  <Play className="size-3 mr-1" />
                  Run
                </Button>
              ) : (
                /* Install button */
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs px-2 py-1 h-6"
                  onClick={handleInstall}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    t('capStore.card.install')
                  )}
                </Button>
              )}
            </div>
            {isInstalled && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs px-4 py-2 h-6 relative"
                    style={{
                      paddingRight: isInstalled ? 14 : undefined,
                    }}
                  >
                    <span className="relative inline-block">
                      <Settings className="size-3" />
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleUninstall}>
                    <Trash2 className="size-3 mr-2" />
                    Uninstall
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
