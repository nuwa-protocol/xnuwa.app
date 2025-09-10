import { Loader2, Package } from 'lucide-react';
import { Button, ScrollArea } from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks';
import { useIntersectionObserver } from '@/shared/hooks/use-intersection-observer';
import { useCapStoreContext } from '../context';
import { useCapStore } from '../stores';
import { CapCard } from './cap-card';
import { CapDetails } from './cap-details';
import { CapStoreLoading } from './cap-store-loading';
import { CapStoreFavoritesContent } from './content-favorites';
import { CapStoreHomeContent } from './content-home';

export function CapStoreContent() {
  const { t } = useLanguage();
  const { activeSection, selectedCap } = useCapStoreContext();
  const {
    remoteCaps: caps,
    isFetching,
    isLoadingMore,
    hasMoreData,
    error,
    loadMore,
    refetch,
  } = useCapStore();

  // infinite scroll trigger and loading indicator
  const { ref: loadingTriggerRef } = useIntersectionObserver({
    threshold: 0.5,
    freezeOnceVisible: false,
    onChange: (isIntersecting) => {
      if (isIntersecting) {
        loadMore();
      }
    },
  });

  // Show cap details if a cap is selected
  if (selectedCap) {
    return <CapDetails />;
  }

  // Show home content if active section is home
  if (activeSection.id === 'home') {
    return <CapStoreHomeContent />;
  }

  if (activeSection.id === 'favorites') {
    return <CapStoreFavoritesContent />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[700px] text-center">
        <Package className="size-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2 text-red-600">
          {t('capStore.status.error')}
        </h3>
        <p className="text-muted-foreground max-w-md mb-4">
          {t('capStore.status.errorDesc')}
        </p>
        <Button variant="outline" onClick={refetch}>
          {t('capStore.status.tryAgain')}
        </Button>
      </div>
    );
  }

  if (isFetching) {
    return <CapStoreLoading />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Caps Grid Container with ScrollArea */}
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-6">
          {caps.length > 0 &&
            caps.map((cap) => {
              const id = cap.id;

              return <CapCard key={id} cap={cap} />;
            })}
        </div>

        {/* Infinite scroll trigger and loading indicator */}
        <div ref={loadingTriggerRef} />
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="size-8 text-muted-foreground animate-spin" />
          </div>
        )}
        {!hasMoreData && caps.length > 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {t('capStore.status.noMoreCaps') || 'No more caps to load'}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
