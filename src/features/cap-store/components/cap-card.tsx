import { Download, Heart, Info, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, Card } from '@/shared/components/ui';
import { capKitService } from '@/shared/services/capkit-service';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import type { RemoteCap } from '../types';
import { CapAvatar } from './cap-avatar';
import { StarRating } from './star-rating';

export interface CapCardProps {
  cap: RemoteCap;
}

export function CapCard({ cap }: CapCardProps) {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [descriptionClamp, setDescriptionClamp] = useState<number>(2);
  const [isHovered, setIsHovered] = useState(false);

  const { setCurrentCap } = CurrentCapStore();

  /**
   * Dynamically calculate the description line number, so that the title (up to 2 lines) and description together take up 4 lines.
   */
  const recomputeClamp = () => {
    const el = titleRef.current;
    if (!el) return;
    const computed = window.getComputedStyle(el);
    const lineHeightPx = parseFloat(computed.lineHeight);
    if (!lineHeightPx) return;
    const height = el.getBoundingClientRect().height;
    const lines = Math.max(1, Math.round(height / lineHeightPx));
    const titleLines = Math.min(lines, 2);
    const clamp = Math.max(0, 4 - titleLines);
    setDescriptionClamp(clamp);
  };

  useEffect(() => {
    recomputeClamp();
    window.addEventListener('resize', recomputeClamp);
    return () => window.removeEventListener('resize', recomputeClamp);
  }, [cap]);

  const handleUseCap = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      toast.promise(
        async () => {
          const capKit = await capKitService.getCapKit();
          const downloadedCap = await capKit.downloadByID(cap.id);
          if (downloadedCap) {
            setCurrentCap(downloadedCap);
            navigate('/chat');
          } else {
            console.error('Failed to download cap:', cap.id);
          }
        },
        {
          loading: 'Loading cap...',
          success: 'Cap loaded successfully',
          error: 'Failed to load cap',
        },
      );
    } catch (error) {
      console.error('Failed to download cap:', error);
    }
  };

  const handleShowDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/explore/caps/${cap.id}`);
  };

  const capMetadata = cap.metadata;
  const capStats = cap.stats;

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow relative overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-3">
        <CapAvatar
          capName={capMetadata.displayName}
          capThumbnail={capMetadata.thumbnail}
          size="xl"
          className="rounded-md"
        />
        <div className="flex-1 min-w-0">
          <h3
            ref={titleRef}
            className="font-medium text-md leading-5 line-clamp-2"
          >
            {capMetadata.displayName}
          </h3>
          {descriptionClamp > 0 ? (
            <p
              className="text-xs text-muted-foreground mt-1 leading-5 overflow-hidden"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: descriptionClamp,
                WebkitBoxOrient: 'vertical' as any,
              }}
            >
              {capMetadata.description}
            </p>
          ) : null}
          {capStats ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-1">
                <Download className="size-3" />
                <span>{capStats.downloads}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="size-3" />
                <span>{capStats.favorites}</span>
              </div>
              <StarRating
                averageRating={capStats.averageRating}
                userRating={capStats.userRating}
                ratingCount={capStats.ratingCount}
                size={14}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Hover Overlay */}
      <div
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
      >
        <Button
          onClick={handleUseCap}
          className="bg-theme-primary hover:bg-theme-primary/90 text-theme-primary-foreground"
        >
          <Play className="w-4 h-4 mr-2" />
          Run
        </Button>
        <Button
          onClick={handleShowDetails}
          variant="secondary"
          className="bg-background/90 hover:bg-background"
        >
          <Info className="w-4 h-4 mr-2" />
          Details
        </Button>
      </div>
    </Card>
  );
}
