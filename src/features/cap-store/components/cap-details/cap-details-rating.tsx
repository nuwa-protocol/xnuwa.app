import { Star, TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from '@/shared/components/ui';
import { Rating, RatingButton } from '@/shared/components/ui/shadcn-io/rating';
import { generateUUID } from '@/shared/utils';
import type { RemoteCap } from '../../types';
import { useCapRatingDistribution } from '../../hooks/use-cap-rating-distribution';
import type { RatingDistribution } from '@nuwa-ai/cap-kit';

interface CapDetailsRatingProps {
  capQueryData: RemoteCap;
  onRate: (rating: number) => void;
}

export function CapDetailsRating({
  capQueryData,
  onRate,
}: CapDetailsRatingProps) {
  const { distribution, isLoading: isLoadingDistribution, error } = useCapRatingDistribution(capQueryData.id);
  
  // Fallback to mock data if there's an error or no data
  const getFallbackDistribution = () => {
    const total = capQueryData.stats.ratingCount || 0;
    return [
      { rating: 5, count: Math.round(total * 0.6) },
      { rating: 4, count: Math.round(total * 0.25) },
      { rating: 3, count: Math.round(total * 0.1) },
      { rating: 2, count: Math.round(total * 0.03) },
      { rating: 1, count: Math.round(total * 0.02) },
    ] as RatingDistribution[];
  };

  const displayDistribution = error || distribution.length === 0 
    ? getFallbackDistribution() 
    : distribution;
  
  const maxCount = Math.max(...displayDistribution.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Ratings & Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="flex flex-col items-center justify-center text-center p-6 bg-muted/50 rounded-lg border">
            <div className="text-5xl font-bold mb-2">
              {capQueryData.stats.averageRating.toFixed(1)}
            </div>
            <div className="mb-3">
              <Rating
                readOnly
                value={Math.round(capQueryData.stats.averageRating)}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <RatingButton
                    key={generateUUID()}
                    size={24}
                    className="text-yellow-500"
                  />
                ))}
              </Rating>
            </div>
            <p className="text-sm text-muted-foreground">
              Based on {capQueryData.stats.ratingCount} reviews
            </p>
          </div>

          {/* Distribution */}
          <div className="space-y-2">
            {isLoadingDistribution ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, index) => (
                  <div key={`loading-${5 - index}-stars`} className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5 min-w-[80px]">
                      {Array.from({ length: 5 - index }).map((_, starIndex) => (
                        <Star
                          key={`loading-star-${5 - index}-${starIndex + 1}`}
                          className="h-3.5 w-3.5 text-yellow-500"
                          fill="currentColor"
                        />
                      ))}
                    </div>
                    <div className="h-2 bg-muted rounded-full flex-1 animate-pulse" />
                    <span className="text-xs text-muted-foreground w-10 text-right">
                      -
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              displayDistribution.map((d) => (
                <div key={d.rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-0.5 min-w-[80px]">
                    {Array.from({ length: d.rating }).map((_, starIndex) => (
                      <Star
                        key={`star-${d.rating}-${starIndex + 1}`}
                        className="h-3.5 w-3.5 text-yellow-500"
                        fill="currentColor"
                      />
                    ))}
                  </div>
                  <Progress value={(d.count / maxCount) * 100} className="h-2" />
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {d.count}
                  </span>
                </div>
              ))
            )}
            {error && (
              <p className="text-xs text-amber-600 mt-2">
                Note: Using estimated distribution due to loading error
              </p>
            )}
          </div>
        </div>

        {/* User Rating Section */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-medium mb-1">Rate this Cap</h3>
              <p className="text-sm text-muted-foreground">
                {capQueryData.stats.userRating
                  ? `You rated this ${capQueryData.stats.userRating} stars`
                  : 'Share your experience with others'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Rating
                defaultValue={capQueryData.stats.userRating ?? 0}
                onValueChange={onRate}
              >
                {Array.from({ length: 5 }).map(() => (
                  <RatingButton
                    key={generateUUID()}
                    size={28}
                    className="text-yellow-500"
                  />
                ))}
              </Rating>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
