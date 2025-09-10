import { ChevronRight, Loader2, Package } from 'lucide-react';
import { useEffect } from 'react';
import { Button, ScrollArea } from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks';
import { useCapStoreContext } from '../context';
import { useRemoteCap } from '../hooks/use-remote-cap';
import type { UseRemoteCapParams, HomeData } from '../stores';
import type { RemoteCap } from '../types';
import { CapCard } from './cap-card';

const HomeSection = ({
  title,
  caps,
  sortBy,
}: {
  title: string;
  caps: RemoteCap[];
  sortBy: UseRemoteCapParams['sortBy'];
}) => {
  const { t } = useLanguage();
  const { setActiveSection } = useCapStoreContext();
  const { fetchCaps } = useRemoteCap();
  const handleViewMore = (sortBy: UseRemoteCapParams['sortBy']) => {
    // Set the section to 'all' and apply the sortBy parameter
    setActiveSection({
      id: 'all',
      label: 'All',
      type: 'section',
    });

    // Fetch caps with the specific sortBy parameter
    fetchCaps({
      sortBy,
      sortOrder: 'desc',
      page: 0,
      size: 45,
    });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewMore(sortBy)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {t('capStore.home.viewMore') || 'View More'}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      {caps.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="size-8 mx-auto mb-2" />
          <p className="text-sm">
            {t('capStore.home.noCaps') || 'No caps available'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {caps.map((cap) => (
            <CapCard key={cap.id} cap={cap} />
          ))}
        </div>
      )}
    </div>
  );
};

export function CapStoreContentHome() {
  const { t } = useLanguage();
  const { homeData, isLoadingHome, homeError, fetchHome } =
    useRemoteCap();

  useEffect(() => {
    // Fetch home data on mount if not already loaded
    if (
      homeData.topRated.length === 0 &&
      homeData.trending.length === 0 &&
      homeData.latest.length === 0 &&
      !isLoadingHome
    ) {
      fetchHome();
    }
  }, [homeData, isLoadingHome, fetchHome]);

  if (homeError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[700px] text-center">
        <Package className="size-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2 text-red-600">
          {t('capStore.status.error') || 'Error Loading Home'}
        </h3>
        <p className="text-muted-foreground max-w-md mb-4">{homeError}</p>
        <Button variant="outline" onClick={fetchHome}>
          {t('capStore.status.tryAgain') || 'Try Again'}
        </Button>
      </div>
    );
  }

  if (isLoadingHome) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[700px] text-center">
        <Loader2 className="size-12 text-muted-foreground mb-4 animate-spin" />
        <h3 className="text-lg font-medium mb-2">
          {t('capStore.status.loading') || 'Loading...'}
        </h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          <HomeSection
            title={t('capStore.home.topRated') || 'Top Rated Caps'}
            caps={homeData.topRated}
            sortBy="average_rating"
          />

          <HomeSection
            title={t('capStore.home.trending') || 'Trending Caps'}
            caps={homeData.trending}
            sortBy="downloads"
          />

          <HomeSection
            title={t('capStore.home.latest') || 'Latest Caps'}
            caps={homeData.latest}
            sortBy="updated_at"
          />
        </div>
      </ScrollArea>
    </div>
  );
}
