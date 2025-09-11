import { Download, Heart } from 'lucide-react';
import type { RemoteCap } from '../../types';
import { StarRating } from '../star-rating';

interface CapDetailsStatsProps {
  capQueryData: RemoteCap;
  onRate: (rating: number) => void;
}

export function CapDetailsStats({
  capQueryData,
  onRate,
}: CapDetailsStatsProps) {
  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-2">
        <Download className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{capQueryData.stats.downloads}</span>
      </div>
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{capQueryData.stats.favorites}</span>
      </div>
      <div className="flex items-center gap-2">
        <StarRating
          averageRating={capQueryData.stats.averageRating}
          userRating={capQueryData.stats.userRating}
          ratingCount={capQueryData.stats.ratingCount}
          size={16}
          isInteractive
          onRate={onRate}
        />
      </div>
    </div>
  );
}

