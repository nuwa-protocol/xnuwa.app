import {
  Download,
  Heart,
  Play,
  Info,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Card,
  Button,
} from '@/shared/components/ui';
import { useCapStoreContext } from '../context';
import { useCapStore } from '../hooks/use-cap-store';
import { useRemoteCap } from '../hooks/use-remote-cap';
import type { InstalledCap, RemoteCap } from '../types';
import { CapAvatar } from './cap-avatar';
import { StarRating } from './star-rating';

export interface CapCardProps {
  cap: InstalledCap | RemoteCap;
}

export function CapCard({ cap }: CapCardProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [descriptionClamp, setDescriptionClamp] = useState<number>(2);
  const [isHovered, setIsHovered] = useState(false);

  const { downloadCap } = useRemoteCap();
  const { setSelectedCap } = useCapStoreContext();
  const { installedCaps } = useCapStore();

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
    const id = 'metadata' in cap ? cap.id : cap.capData.id;
    const installedCap = installedCaps[id];
    if (installedCap) {
      // Run the cap - you may need to implement this based on your app's navigation
      console.log('Running cap:', installedCap);
    } else {
      if ('id' in cap) {
        try {
          const downloadedCap = await downloadCap(cap as RemoteCap);
          console.log('Running downloaded cap:', downloadedCap);
        } catch (error) {
          console.error('Failed to download cap:', error);
        }
      }
    }
  };

  const handleShowDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    const id = 'metadata' in cap ? cap.id : cap.capData.id;
    const installedCap = installedCaps[id];
    if (installedCap) {
      setSelectedCap(installedCap);
    } else {
      if ('id' in cap) {
        // For remote caps, you might want to show details without downloading
        setSelectedCap(cap as any);
      }
    }
  };


  const capMetadata = 'metadata' in cap ? cap.metadata : cap.capData.metadata;
  const capStats = 'stats' in cap ? cap.stats : null;

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
      <div className={`absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity duration-200 ${
        isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <Button
          onClick={handleUseCap}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Play className="w-4 h-4 mr-2" />
          Use
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
