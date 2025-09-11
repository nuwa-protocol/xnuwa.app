import { Lightbulb } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/shared/components/ui';
import { useCapKit } from '@/shared/hooks/use-capkit';
import { generateUUID } from '@/shared/utils';
import type { RemoteCap } from '../../types';
import { mapResultsToRemoteCaps } from '../../utils';
import { CapCard } from '../cap-card';

interface CapDetailsRecommendationsProps {
  currentCapId: string;
  tags?: string[];
}

export function CapDetailsRecommendations({
  currentCapId,
  tags = [],
}: CapDetailsRecommendationsProps) {
  const { capKit } = useCapKit();
  const [isLoading, setIsLoading] = useState(true);
  const [caps, setCaps] = useState<RemoteCap[]>([]);
  const [error, setError] = useState<string | null>(null);

  const queryTags = useMemo(() => tags.filter(Boolean), [tags]);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!capKit) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await capKit.queryByName('', {
          tags: queryTags,
          page: 0,
          size: 6,
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
  }, [capKit, currentCapId, queryTags.join(',')]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" /> Try These Next
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={generateUUID()} className="h-24 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : caps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recommendations yet.
          </p>
        ) : (
          <div className="grid gap-3">
            {caps.map((cap) => (
              <CapCard key={cap.id} cap={cap} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
