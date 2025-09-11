import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui';
import { useCapKit } from '@/shared/hooks/use-capkit';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import type { Cap } from '@/shared/types';
import type { RemoteCap } from '../../types';
import { mapResultToRemoteCap } from '../../utils';
import { CapDetailsConfiguration } from './cap-details-configuration';
import { CapDetailsHeader } from './cap-details-header';
import { CapDetailsLoadingSkeleton } from './cap-details-loading-skeleton';
import { CapDetailsRating } from './cap-details-rating';
import { CapDetailsRecommendations } from './cap-details-recommendations';

export function CapDetails({ capId }: { capId: string }) {
  const navigate = useNavigate();
  const { capKit } = useCapKit();
  const { setCurrentCap } = CurrentCapStore();
  const [isLoading, setIsLoading] = useState(true);
  const [downloadedCapData, setDownloadedCapData] = useState<Cap | null>(null);
  const [capQueryData, setCapQueryData] = useState<RemoteCap | null>(null);
  const [isCapFavorite, setIsCapFavorite] = useState<boolean>(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState<boolean>(false);

  // Fetch full cap data when selectedCap changes
  useEffect(() => {
    const fetchCap = async () => {
      if (!capKit) return;

      try {
        const downloadedCap = await capKit.downloadByID(capId);
        setDownloadedCapData(downloadedCap);
      } catch (error) {
        console.error('Failed to download cap data:', error);
        toast.error('Failed to find the cap.');
        navigate('/explore');
      }
    };

    const fetchFavoriteStatus = async () => {
      if (!capKit) return;

      try {
        const favoriteStatus = await capKit.favorite(capId, 'isFavorite');
        setIsCapFavorite(favoriteStatus.data ?? false);
      } catch (error) {
        console.error('Failed to fetch favorite status:', error);
      }
    };

    const queryCap = async () => {
      if (!capKit) return;

      try {
        const queriedCap = await capKit.queryByID({ id: capId });
        setCapQueryData(mapResultToRemoteCap(queriedCap));
      } catch (error) {
        console.error('Failed to download cap data:', error);
        toast.error('Failed to find the cap.');
        navigate('/explore');
      }
    };

    Promise.all([fetchCap(), fetchFavoriteStatus(), queryCap()]).finally(() => {
      setIsLoading(false);
    });
  }, [capKit]);

  if (isLoading || !downloadedCapData || !capQueryData) {
    return <CapDetailsLoadingSkeleton />;
  }

  const handleRateCap = async (rating: number) => {
    try {
      await capKit?.rateCap(capId, rating);
      toast.success(
        `You rated ${capQueryData.metadata.displayName} ${rating} stars!`,
      );
    } catch (error) {
      toast.error('Failed to submit your rating. Please try again.');
    }
  };

  const handleRunCap = async () => {
    setIsLoading(true);
    try {
      // If we already have the full cap data, use it directly
      if (downloadedCapData) {
        setCurrentCap(downloadedCapData);
        navigate('/chat');
      }
    } catch (error) {
      toast.error('Failed to run cap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    setIsTogglingFavorite(true);
    if (!capKit) return;

    try {
      if (isCapFavorite) {
        await capKit.favorite(capId, 'remove');
        setIsCapFavorite(false);
        toast.success(
          `Removed ${capQueryData.metadata.displayName} from favorites`,
        );
      } else {
        await capKit.favorite(capId, 'add');
        setIsCapFavorite(true);
        toast.success(
          `Added ${capQueryData.metadata.displayName} to favorites`,
        );
      }
    } catch (error) {
      toast.error('Failed to update favorite status. Please try again.');
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
          {/* Back Button */}
          <div className="-mt-2">
            <Button
              variant="ghost"
              className="gap-2 group hover:-translate-x-0.5 transition-transform duration-150"
              onClick={() => navigate(-1)}
              aria-label="Go back"
            >
              <ChevronLeft className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
              Back
            </Button>
          </div>
          {/* Header Section with Hero Layout */}
          <CapDetailsHeader
            capQueryData={capQueryData}
            isLoading={isLoading}
            isCapFavorite={isCapFavorite}
            isTogglingFavorite={isTogglingFavorite}
            onRunCap={handleRunCap}
            onToggleFavorite={handleToggleFavorite}
            downloadedCapData={downloadedCapData}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Tabbed Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="overview">
                <TabsList className="w-full p-0 bg-background justify-start border-b rounded-none mb-4">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none bg-background h-full data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="ratings"
                    className="rounded-none bg-background h-full data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary"
                  >
                    Ratings
                  </TabsTrigger>
                  <TabsTrigger
                    value="configuration"
                    className="rounded-none bg-background h-full data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary"
                  >
                    Configuration
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>About This Cap</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed text-base break-words">
                        {capQueryData.metadata.description}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ratings" className="mt-0">
                  <CapDetailsRating
                    capQueryData={capQueryData}
                    onRate={handleRateCap}
                  />
                </TabsContent>

                <TabsContent value="configuration" className="mt-0">
                  <CapDetailsConfiguration
                    downloadedCapData={downloadedCapData}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Recommendations */}
            <div className="space-y-6 mt-14">
              <CapDetailsRecommendations
                currentCapId={capId}
                tags={capQueryData.metadata.tags}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
