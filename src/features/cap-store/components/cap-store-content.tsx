import { Clock, Loader2, Package, Star } from 'lucide-react';
import { Button, ScrollArea } from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks';
import { useIntersectionObserver } from '@/shared/hooks/use-intersection-observer';
import type { Cap } from '@/shared/types/cap';
import { useCapStore } from '../hooks/use-cap-store';
import type { CapStoreSidebarSection, RemoteCap } from '../types';
import { CapCard } from './cap-card';

export interface CapStoreContentProps {
  caps: (Cap | RemoteCap)[];
  activeSection: CapStoreSidebarSection;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMoreData?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onLoadMore?: () => void;
}

export function CapStoreContent({
  caps,
  activeSection,
  isLoading = false,
  isLoadingMore = false,
  hasMoreData = false,
  error = null,
  onRefresh,
  onLoadMore,
}: CapStoreContentProps) {
  const { t } = useLanguage();
  const {
    addCapToFavorite,
    removeCapFromFavorite,
    removeCapFromRecents,
    isCapFavorite,
  } = useCapStore();

  const isShowingInstalledCaps = ['favorites', 'recent'].includes(
    activeSection.id,
  );

  const { ref: loadingTriggerRef } = useIntersectionObserver({
    threshold: 0.5,
    freezeOnceVisible: false,
    onChange: (isIntersecting) => {
      if (isIntersecting) {
        onLoadMore?.();
      }
    },
  });


  // Function to get actions based on cap type and active section
  const getCapActions = (cap: Cap | RemoteCap) => {
    const actions = [];

    const isRemoteCap = 'cid' in cap;

    if (isCapFavorite(cap.id)) {
      actions.push({
        icon: <Star className="size-4" />,
        label: 'Remove from Favorites',
        onClick: () => removeCapFromFavorite(cap.id),
      });
    } else {
      actions.push({
        icon: <Star className="size-4" />,
        label: 'Add to Favorites',
        onClick: () =>
          addCapToFavorite(cap.id, isRemoteCap ? cap.cid : undefined),
      });
    }

    if (activeSection.id === 'recent') {
      actions.push({
        icon: <Clock className="size-4" />,
        label: 'Remove from Recents',
        onClick: () => removeCapFromRecents(cap.id),
      });
    }

    return actions;
  };

  if (error && !isShowingInstalledCaps) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[700px] text-center">
        <Package className="size-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2 text-red-600">
          {t('capStore.status.error')}
        </h3>
        <p className="text-muted-foreground max-w-md mb-4">
          {t('capStore.status.errorDesc')}
        </p>
        <Button variant="outline" onClick={onRefresh}>
          {t('capStore.status.tryAgain')}
        </Button>
      </div>
    );
  }

  if (isLoading && !isShowingInstalledCaps) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[700px] text-center">
        <Loader2 className="size-12 text-muted-foreground mb-4 animate-spin" />
        <h3 className="text-lg font-medium mb-2">
          {t('capStore.status.loading')}
        </h3>
      </div>
    );
  }

  if (caps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[700px] text-center">
        <Package className="size-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {getEmptyStateTitle(activeSection.id, t)}
        </h3>
        <p className="text-muted-foreground max-w-md">
          {getEmptyStateDescription(activeSection.id, t)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Section Title */}
      <div className="flex items-center justify-between border-b border-muted-foreground/20 m-6">
        <h2 className="text-lg font-medium pb-2">{activeSection.label}</h2>
      </div>

      {/* Caps Grid Container with ScrollArea */}
      <ScrollArea
        className="flex-1"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6 py-2">
          {caps.length > 0 &&
            caps.map((cap) => {
              // Type guard to check if cap is RemoteCap (has cid property)
              const isRemoteCap = 'cid' in cap;

              if (isRemoteCap) {
                // RemoteCap type - use cid as unique key
                return (
                  <CapCard
                    key={cap.id}
                    cap={cap}
                    actions={getCapActions(cap)}
                  />
                );
              } else {
                // Cap type - use id as unique key
                return (
                  <CapCard
                    key={cap.id}
                    cap={cap}
                    actions={getCapActions(cap)}
                  />
                );
              }
            })}
        </div>

        {/* Infinite scroll trigger and loading indicator */}
        {!isShowingInstalledCaps && (
          <>
            <div ref={loadingTriggerRef} />
            {isLoadingMore && (
              <div className="flex justify-center py-4">
                <Loader2 className="size-6 text-muted-foreground animate-spin" />
              </div>
            )}
            {!hasMoreData && caps.length > 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                {t('capStore.status.noMoreCaps') || 'No more caps to load'}
              </div>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  );
}

function getEmptyStateTitle(activeSection: string, t: any): string {
  switch (activeSection) {
    case 'favorites':
      return t('capStore.status.noFavoriteCaps') || 'No Favorite Caps';
    case 'recent':
      return t('capStore.status.noRecentCaps') || 'No Recent Caps';
    default:
      return t('capStore.status.noCaps') || 'No Caps Found';
  }
}

function getEmptyStateDescription(activeSection: string, t: any): string {
  switch (activeSection) {
    case 'favorites':
      return (
        t('capStore.status.noFavoriteCapsDesc') ||
        "You haven't marked any caps as favorites yet. Browse the store and favorite caps you like."
      );
    case 'recent':
      return (
        t('capStore.status.noRecentCapsDesc') ||
        "You haven't used any caps recently. Try running a cap to see it here."
      );
    default:
      return (
        t('capStore.status.noCapsDesc.category') ||
        'No caps found in this category. Try searching or browse other categories.'
      );
  }
}
