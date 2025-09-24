import { Loader2, Package } from 'lucide-react';
import { useEffect } from 'react';
import { Button, ScrollArea } from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks';
import { useIntersectionObserver } from '@/shared/hooks/use-intersection-observer';
import { type UseRemoteCapParams, useCapStore } from '../stores';
import { CapCard } from './cap-card';
import { CapStoreLoading } from './cap-store-loading';
import { CapStoreContentHeader } from './content-header';

export function CapStoreCapsContent({
  tag,
  sortBy,
  search,
}: {
  tag: string | null;
  sortBy: string | null;
  search: string | null;
}) {
  const { t } = useLanguage();
  const {
    remoteCaps: caps,
    isFetching,
    isLoadingMore,
    hasMoreData,
    error,
    loadMore,
    refetch,
    fetchCaps,
  } = useCapStore();

  useEffect(() => {
    fetchCaps({
      tags: tag ? [tag] : undefined,
      sortBy: sortBy ? (sortBy as UseRemoteCapParams['sortBy']) : undefined,
      searchQuery: search || undefined,
    });
  }, [tag, sortBy, search, fetchCaps]);

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

  if (isFetching && true) {
    return <CapStoreLoading />;
  }

  if (caps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[700px] text-center">
        <Package className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2 text-muted-foreground">
          No AI Caps Found
        </h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <CapStoreContentHeader showSearchAndSort={true} />

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
