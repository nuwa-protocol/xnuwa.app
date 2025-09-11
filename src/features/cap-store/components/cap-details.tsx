import { format } from 'date-fns';
import {
  BadgeCheck,
  Copy,
  Download,
  Heart,
  Play,
  Star,
  Tag,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui';
import { useCapKit } from '@/shared/hooks/use-capkit';
import { useCopyToClipboard } from '@/shared/hooks/use-copy-to-clipboard';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import type { Cap } from '@/shared/types';
import type { RemoteCap } from '../types';
import { mapResultToRemoteCap } from '../utils';
import { CapAvatar } from './cap-avatar';
import { StarRating } from './star-rating';

export function CapDetails({ capId }: { capId: string }) {
  const navigate = useNavigate();
  const { capKit } = useCapKit();
  const [copyToClipboard, isCopied] = useCopyToClipboard();
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
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 md:p-8 mb-4 hide-scrollbar">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-4 space-y-6">
                {/* Header Section Skeleton */}
                <div className="flex flex-col sm:flex-row gap-6 justify-between items-start">
                  <div className="flex gap-6">
                    {/* Avatar skeleton */}
                    <div className="flex-shrink-0">
                      <Skeleton className="w-20 h-20 rounded-xl" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-4">
                      {/* Title and badges skeleton */}
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-6 w-12" />
                        <Skeleton className="h-6 w-20" />
                      </div>

                      {/* ID skeleton */}
                      <Skeleton className="h-4 w-48" />

                      {/* Tags skeleton */}
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-14" />
                      </div>

                      {/* Action buttons skeleton */}
                      <div className="flex gap-3">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-32" />
                      </div>
                    </div>
                  </div>

                  {/* Right side skeleton */}
                  <div className="flex flex-col gap-4 items-end">
                    <Skeleton className="h-6 w-40" />
                    <div className="flex gap-6">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>

                {/* Description skeleton */}
                <div className="space-y-3">
                  <Skeleton className="h-6 w-24" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>

                {/* Configuration skeleton */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-10 w-24" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/5" />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleRateCap = async (rating: number) => {
    try {
      await capKit?.rateCap(capId, rating);
      toast.success(`You rated ${capQueryData.metadata.displayName} ${rating} stars!`);
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
        toast.success(`Removed ${capQueryData.metadata.displayName} from favorites`);
      } else {
        await capKit.favorite(capId, 'add');
        setIsCapFavorite(true);
        toast.success(`Added ${capQueryData.metadata.displayName} to favorites`);
      }
    } catch (error) {
      toast.error('Failed to update favorite status. Please try again.');
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const formatDate = (timestamp: number | string | undefined) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = new Date(timestamp);
      if (Number.isNaN(date.getTime())) return 'Unknown';
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Unknown';
    }
  };

  const handleCopyAuthor = async () => {
    if (capQueryData?.authorDID) {
      await copyToClipboard(capQueryData.authorDID);
      toast.success('Author DID copied to clipboard!');
    }
  };

  const truncateAuthor = (did: string) => {
    if (did.length > 16) {
      return `${did.slice(0, 8)}...${did.slice(-8)}`;
    }
    return did;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 mb-4 hide-scrollbar">
        <div className="max-w-6xl mx-auto">
          {/* Main Layout: Left Content + Right Information Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Content Area */}
            <div className="lg:col-span-4 space-y-6">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row gap-6 justify-between items-start">
                {/* Left side of header */}
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <CapAvatar
                      capName={capQueryData.metadata.displayName}
                      capThumbnail={capQueryData.metadata.thumbnail}
                      size="xl"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold break-words">
                        {capQueryData.metadata.displayName}
                      </h1>
                      <Badge variant="outline" className="text-sm">
                        v {capQueryData.version}
                      </Badge>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="secondary"
                              className="gap-1.5 text-green-600 border-green-600/50"
                            >
                              <BadgeCheck className="h-4 w-4" />
                              Verified
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              This Cap Server has passed installation
                              verification, ensuring its quality and
                              reliability.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      {capQueryData.id && (
                        <p className="font-mono break-all">
                          @{capQueryData.idName}
                        </p>
                      )}
                      {capQueryData.id && <span>·</span>}
                    </div>
                    <div className="mt-4 flex flex-col gap-3">
                      {/* Tags */}
                      {capQueryData.metadata.tags &&
                        capQueryData.metadata.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              Tags:
                            </span>
                            {capQueryData.metadata.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="gap-1"
                              >
                                <Tag className="h-3 w-3" />
                                <span className="truncate">{tag}</span>
                              </Badge>
                            ))}
                          </div>
                        )}
                    </div>
                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleRunCap}
                        disabled={isLoading}
                        className="gap-2"
                      >
                        <Play className="h-4 w-4" />
                        {isLoading ? 'Running...' : 'Run Cap'}
                      </Button>
                      {isCapFavorite ? (
                        <Button
                          variant="outline"
                          onClick={handleToggleFavorite}
                          disabled={isTogglingFavorite}
                          className="gap-2 group"
                        >
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          <span className="group-hover:hidden">Favorited</span>
                          <span className="hidden group-hover:inline">
                            Remove
                          </span>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={handleToggleFavorite}
                          className="gap-2"
                        >
                          <Star className="h-4 w-4" />
                          Add to Favorites
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side of header */}
                <div className="flex flex-col gap-4 sm:items-end flex-shrink-0">
                  {/* Author Badge */}
                  {capQueryData.authorDID && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Author:
                      </span>
                      <Badge
                        variant={isCopied ? 'default' : 'outline'}
                        className="gap-2 cursor-pointer hover:bg-accent"
                        onClick={handleCopyAuthor}
                      >
                        <Copy className="h-3 w-3 flex-shrink-0" />
                        <span className="font-mono truncate">
                          {isCopied
                            ? 'Copied!'
                            : truncateAuthor(capQueryData.authorDID)}
                        </span>
                      </Badge>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {capQueryData.stats.downloads}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {capQueryData.stats.favorites}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating
                        averageRating={capQueryData.stats.averageRating}
                        userRating={capQueryData.stats.userRating}
                        ratingCount={capQueryData.stats.ratingCount}
                        size={16}
                        isInteractive
                        onRate={handleRateCap}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {capQueryData.metadata.description && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Description</h2>
                  <p className="text-muted-foreground leading-relaxed text-base break-words">
                    {capQueryData.metadata.description}
                  </p>
                </div>
              )}

              {/* Details Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Configuration</h2>
                <Card className="p-6">
                  <Tabs defaultValue="prompt" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="prompt">Prompt</TabsTrigger>
                      <TabsTrigger value="model">Model</TabsTrigger>
                      <TabsTrigger value="mcp">MCP Servers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="prompt" className="mt-4">
                      <div className="space-y-3 bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                        <p className="text-muted-foreground break-words whitespace-pre-wrap font-mono text-sm">
                          {typeof downloadedCapData.core.prompt === 'string'
                            ? downloadedCapData.core.prompt
                            : downloadedCapData.core.prompt.value ||
                            'No prompt configured.'}
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="model" className="mt-4">
                      <div className="max-h-96 overflow-y-auto">
                        {downloadedCapData.core.model ? (
                          <div className="space-y-4">
                            {/* Model Name and Provider */}
                            <div className="p-4 bg-muted rounded-lg">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-muted-foreground flex-shrink-0">
                                  Model ID:
                                </span>
                                <span className="font-medium text-right break-words">
                                  {downloadedCapData.core.model.modelId}
                                </span>
                              </div>
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-muted-foreground flex-shrink-0">
                                  LLM Gateway:
                                </span>
                                <span className="font-medium text-right break-words">
                                  {downloadedCapData.core.model.customGatewayUrl ||
                                    'Nuwa LLM Gateway'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No model configuration available.
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="mcp" className="mt-4">
                      <div className="max-h-96 overflow-y-auto">
                        {downloadedCapData.core.mcpServers &&
                          Object.keys(downloadedCapData.core.mcpServers).length > 0 ? (
                          <div className="space-y-3">
                            {Object.entries(downloadedCapData.core.mcpServers).map(
                              ([name, server]: [string, any]) => (
                                <div
                                  key={name}
                                  className="flex justify-between items-center p-3 bg-muted rounded-lg gap-2 min-w-0"
                                >
                                  <span className="font-medium truncate">
                                    {name}
                                  </span>
                                  <span className="font-mono truncate">
                                    {typeof server === 'string'
                                      ? server
                                      : server.command || 'N/A'}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No MCP servers configured.
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
