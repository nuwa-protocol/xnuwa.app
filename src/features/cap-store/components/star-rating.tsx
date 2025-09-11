import { Star } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { generateUUID } from '@/shared/utils';

interface StarRatingProps {
  averageRating: number;
  userRating?: number;
  ratingCount: number;
  size?: number;
  onRate?: (rating: number) => void;
  isInteractive?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  averageRating,
  userRating,
  ratingCount,
  size = 12,
  onRate,
  isInteractive = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const formatRatingCount = (count: number) => {
    if (count === 0) {
      return '0';
    }
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}m`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count;
  };

  const handleRate = (rating: number) => {
    if (isInteractive && onRate) {
      onRate(rating);
    }
  };

  const ratingValue = isInteractive
    ? (hoverRating ?? userRating ?? averageRating)
    : averageRating;
  const ratingColor =
    isInteractive && (hoverRating !== null || userRating !== undefined)
      ? 'text-blue-500'
      : 'text-yellow-400';

  return (
    <div className="flex items-center gap-1.5">
      <div
        role="button"
        className="flex"
        onMouseLeave={() => isInteractive && setHoverRating(null)}
      >
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;

          const fillWidth =
            ratingValue >= starValue
              ? '100%'
              : ratingValue > i
                ? `${(ratingValue - i) * 100}%`
                : '0%';

          return (
            <div
              key={`star-${generateUUID()}`}
              role="button"
              className="relative"
              style={{
                width: size,
                height: size,
                cursor: isInteractive ? 'pointer' : 'default',
              }}
              onMouseEnter={() => isInteractive && setHoverRating(starValue)}
              onClick={() => handleRate(starValue)}
            >
              {/* Background star */}
              <Star size={size} className="text-gray-300" fill="currentColor" />

              {/* Filled portion */}
              <div
                className="absolute top-0 left-0 h-full overflow-hidden"
                style={{ width: fillWidth }}
              >
                <Star
                  size={size}
                  className={`${ratingColor} flex-shrink-0`}
                  fill="currentColor"
                />
              </div>
            </div>
          );
        })}
      </div>
      {averageRating > 0 && (
        <span className="text-xs font-bold text-yellow-500">
          {averageRating.toFixed(1)}
        </span>
      )}
      {ratingCount > 0 && (
        <span className="text-xs text-muted-foreground">
          ({formatRatingCount(ratingCount)})
        </span>
      )}
    </div>
  );
};
