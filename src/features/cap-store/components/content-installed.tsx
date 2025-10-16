import { Loader2, MoreVertical, Package, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ScrollArea,
} from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { InstalledCapsStore } from '@/shared/stores/installed-caps-store';
import { CapCard } from './cap-card';
import { CapActionButton } from './cap-action-button';
import { CapStoreLoading } from './cap-store-loading';
import { CapStoreContentHeader } from './content-header';

// Installed caps list (previously Favorites)
export function CapStoreInstalledContent() {
  const { t } = useLanguage();
  const {
    installedCaps,
    installedCapsError,
    isFetchingInstalledCaps,
    fetchInstalledCaps,
    uninstallCap,
  } = InstalledCapsStore();
  const { currentCap, setCurrentCap } = CurrentCapStore();
  const [uninstallingIds, setUninstallingIds] = useState<Set<string>>(
    () => new Set(),
  );

  const markUninstalling = (capId: string) =>
    setUninstallingIds((prev) => {
      const next = new Set(prev);
      next.add(capId);
      return next;
    });

  const unmarkUninstalling = (capId: string) =>
    setUninstallingIds((prev) => {
      const next = new Set(prev);
      next.delete(capId);
      return next;
    });

  const handleUninstallCap = async (capId: string, capName: string) => {
    if (uninstallingIds.has(capId)) return;

    markUninstalling(capId);
    try {
      await uninstallCap(capId);
      if (currentCap && !('capData' in currentCap) && currentCap.id === capId) {
        setCurrentCap(null);
      }
      toast.success(`Uninstalled ${capName}`);
    } catch (error) {
      console.error('Failed to uninstall cap:', error);
      toast.error('Failed to uninstall. Please try again.');
    } finally {
      unmarkUninstalling(capId);
    }
  };

  // Backend API still uses the "favorite" concept; UI calls them "Installed Caps".
  const caps = installedCaps;

  if (installedCapsError) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[700px] text-center">
        <Package className="size-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2 text-red-600">
          {t('capStore.status.error')}
        </h3>
        <p className="text-muted-foreground max-w-md mb-4">
          {t('capStore.status.errorDesc')}
        </p>
        <Button variant="outline" onClick={fetchInstalledCaps}>
          {t('capStore.status.tryAgain')}
        </Button>
      </div>
    );
  }

  if (isFetchingInstalledCaps) {
    return <CapStoreLoading />;
  }

  if (caps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-[700px] text-center">
        <Package className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Installed Caps</h3>
        <p className="text-muted-foreground max-w-md">
          You haven't installed any caps yet. Browse the store and install caps you like.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <CapStoreContentHeader showSearchAndSort={false} />

      {/* Caps Grid Container with ScrollArea */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
          {caps.length > 0 &&
            caps.map((cap) => {
              const isUninstalling = uninstallingIds.has(cap.id);
              return (
                <CapCard
                  key={cap.id}
                  cap={cap}
                  actions={
                    <div
                      className="flex items-center gap-1"
                      onClick={(event) => event.stopPropagation()}
                      onPointerDown={(event) => event.stopPropagation()}
                    >
                      <CapActionButton cap={cap} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-foreground"
                            onClick={(event) => event.stopPropagation()}
                            onPointerDown={(event) => event.stopPropagation()}
                            aria-label="Cap options"
                          >
                            {isUninstalling ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <MoreVertical className="size-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onCloseAutoFocus={(event) => {
                            // prevent card focus (which triggers navigation) when menu closes
                            event.preventDefault();
                          }}
                        >
                          <DropdownMenuItem
                            disabled={isUninstalling}
                            onSelect={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              handleUninstallCap(
                                cap.id,
                                cap.metadata.displayName,
                              );
                            }}
                          >
                            <Trash2 className="size-4" />
                            Uninstall
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  }
                />
              );
            })}
        </div>
      </ScrollArea>
    </div>
  );
}
