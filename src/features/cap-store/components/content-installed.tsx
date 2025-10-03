import { Package } from 'lucide-react';
import { Button, ScrollArea } from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks';
import { InstalledCapsStore } from '@/shared/stores/installed-caps-store';
import { CapCard } from './cap-card';
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
  } = InstalledCapsStore();

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
          {caps.length > 0 && caps.map((cap) => <CapCard key={cap.id} cap={cap} />)}
        </div>
      </ScrollArea>
    </div>
  );
}
