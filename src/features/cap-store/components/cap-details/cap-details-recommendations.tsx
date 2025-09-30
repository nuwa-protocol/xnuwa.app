import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CapAvatar } from '@/shared/components/cap-avatar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/shared/components/ui';
import { capKitService } from '@/shared/services/capkit-service';
import type { Cap } from '@/shared/types';
import { generateUUID } from '@/shared/utils';
import type { RemoteCap } from '../../types';
import { mapResultsToRemoteCaps } from '../../utils';

interface CapDetailsRecommendationsProps {
  currentCapId: string;
  tags?: string[];
}

export function CapDetailsRecommendations({
  currentCapId,
  tags = [],
}: CapDetailsRecommendationsProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [caps, setCaps] = useState<RemoteCap[]>([]);
  const [error, setError] = useState<string | null>(null);

  const queryTags = useMemo(() => tags.filter(Boolean), [tags]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const capKit = await capKitService.getCapKit();
      setIsLoading(true);
      setError(null);
      try {
        const response = await capKit.queryByName('', {
          tags: queryTags,
          page: 0,
          size: 15,
          sortBy: 'downloads',
          sortOrder: 'desc',
        });
        const items = mapResultsToRemoteCaps(response).filter(
          (c) => c.id !== currentCapId,
        );
        if (!mounted) return;
        setCaps(items);
      } catch (e) {
        console.error('Failed to fetch recommendations', e);
        if (!mounted) return;
        setError('Failed to fetch recommendations.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [currentCapId, queryTags.join(',')]);

  return (
    <Card className="border-none shadow-none p-0 gap-4">
      <CardHeader className="pb-0 mb-0 px-0">
        <CardTitle className="flex items-center gap-2 pt-2 pb-0 mb-0">
          More Similar Caps
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(4)].map(() => (
              <Skeleton key={generateUUID()} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : caps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recommendations yet.
          </p>
        ) : (
          <div className="h-[calc(100vh-450px)] pr-2 overflow-y-auto hide-scrollbar">
            <div className="flex flex-col gap-2">
              {caps.map((cap) => {
                const meta = cap.metadata;
                const stats = cap.stats;
                return (
                  <div
                    key={cap.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/explore/caps/${cap.id}`)}
                    className="flex items-center gap-3 rounded-md border px-2 py-2 hover:bg-muted cursor-pointer"
                  >
                    <CapAvatar
                      cap={cap as unknown as Cap}
                      size="lg"
                      className="rounded-md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium leading-5 line-clamp-1">
                        {meta.displayName}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-3">
                        {meta.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
