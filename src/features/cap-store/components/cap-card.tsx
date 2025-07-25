import {
  AlertCircle,
  Download,
  Loader2,
  Play,
  Settings,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/shared/components';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks/use-language';
import { useCurrentCap } from '../hooks/use-current-cap';
import { useInstalledCap } from '../hooks/use-installed-cap';
import type { RemoteCap } from '../types';

export interface CapCardProps {
  cap: RemoteCap;
  onRun?: () => void;
}

export function CapCard({ cap, onRun }: CapCardProps) {
  const {
    installCap,
    uninstallCap,
    updateInstalledCap,
    isInstalled,
    hasUpdate,
  } = useInstalledCap(cap);
  const { setCurrentCap } = useCurrentCap();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const handleInstall = async () => {
    setIsLoading(true);
    try {
      installCap(cap);
      toast({
        type: 'success',
        description: `${cap.name} has been installed`,
      });
    } catch (error) {
      toast({
        type: 'error',
        description: t('capStore.card.installFailed'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUninstall = async () => {
    setIsLoading(true);
    try {
      uninstallCap(cap.id);
      toast({
        type: 'success',
        description: `${cap.name} has been uninstalled`,
      });
    } catch (error) {
      toast({
        type: 'error',
        description: t('capStore.card.uninstallFailed'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRun = () => {
    setCurrentCap(cap.id);
    onRun?.();
  };

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      updateInstalledCap(cap.id, cap);
      toast({
        type: 'success',
        description: `${cap.name} has been updated`,
      });
    } catch (error) {
      toast({
        type: 'error',
        description: t('capStore.card.updateFailed'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Avatar className="size-10 shrink-0">
          <AvatarImage
            src={`https://avatar.vercel.sh/${cap.name}`}
            alt={cap.name}
          />
          <AvatarFallback>{cap.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-sm truncate">{cap.name}</h3>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {cap.tag}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {cap.description}
          </p>

          {/* Version and metadata info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            {cap.author && (
              <span className="text-xs">
                {t('capStore.card.by', { author: cap.author })}
              </span>
            )}
            <div className="flex items-center gap-1">
              <Download className="size-3" />
              <span>{cap.downloads.toLocaleString()}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isInstalled ? (
                <>
                  {/* Run button */}
                  <Button
                    size="sm"
                    variant="default"
                    className="text-xs px-2 py-1 h-6"
                    onClick={handleRun}
                  >
                    <Play className="size-3 mr-1" />
                    Run
                  </Button>

                  {/* Settings dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs px-4 py-2 h-6 relative"
                        style={{
                          paddingRight:
                            hasUpdate && isInstalled ? 14 : undefined,
                        }}
                      >
                        <span className="relative inline-block">
                          <Settings className="size-3" />
                          {hasUpdate && isInstalled && (
                            <span
                              className="absolute -top-1 -right-1 block h-2 w-2 rounded-full bg-orange-500 border border-white"
                              style={{ zIndex: 1 }}
                            />
                          )}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {hasUpdate && isInstalled && (
                        <DropdownMenuItem
                          onClick={handleUpdate}
                          disabled={isLoading}
                        >
                          <AlertCircle className="size-3 mr-2 text-orange-500" />
                          {isLoading ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            t('capStore.card.update')
                          )}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleUninstall}>
                        <Trash2 className="size-3 mr-2" />
                        Uninstall
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
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

              {/* Update indicator */}
              {/* {hasUpdate && isInstalled && <AlertCircle className="size-3 text-orange-500" />} */}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
