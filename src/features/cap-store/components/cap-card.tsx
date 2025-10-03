import { Download, Heart, Info, PackagePlus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CapAvatar } from '@/shared/components/cap-avatar';
import { Badge, Button, Card } from '@/shared/components/ui';
import { capKitService } from '@/shared/services/capkit-service';
import { InstalledCapsStore } from '@/shared/stores/installed-caps-store';
import type { RemoteCap } from '../types';
import type { Cap } from '@/shared/types';
import { StarRating } from './star-rating';

export interface CapCardProps {
  cap: RemoteCap | Cap;
}

export function CapCard({ cap }: CapCardProps) {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [descriptionClamp, setDescriptionClamp] = useState<number>(2);
  const [isHovered, setIsHovered] = useState(false);

  const { installedCaps, fetchInstalledCaps } = InstalledCapsStore();

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

  const handleInstallCap = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const capKit = await capKitService.getCapKit();
    toast.promise(capKit.favorite(cap.id, 'add'), {
      loading: 'Installing...',
      success: async () => {
        try {
          await fetchInstalledCaps();
        } catch {
          /* noop */
        }
        return `Installed ${cap.metadata.displayName}`;
      },
      error: 'Failed to install. Please try again.',
    });
  };

  const handleShowDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/explore/caps/${cap.id}`);
  };

  const capMetadata = cap.metadata;
  const capStats = 'stats' in cap ? cap.stats : undefined;

  const isInstalled = installedCaps.some((c) => c.id === cap.id);

  return (
    <Card
      className={`p-4 transition-shadow relative overflow-hidden group shadow-lg
        ${isInstalled
          ? 'border-theme-primary cursor-pointer hover:shadow-md hover:bg-accent/40 transition-colors transition-all'
          : 'hover:shadow-md'
        }
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (isInstalled) navigate(`/explore/caps/${cap.id}`);
      }}
    >
      {isInstalled && (
        <Badge className="absolute bottom-3 right-3 bg-theme-primary text-white border border-theme-primary">
          Installed
        </Badge>
      )}
      <div className="flex items-start gap-3">
        <CapAvatar cap={cap} size="7xl" className="rounded-md" />
        <div className="flex-1 min-w-0">
          <h3
            ref={titleRef}
            className="font-medium text-md leading-5 line-clamp-1"
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

      {/* Hover Overlay (only when not installed) */}
      {!isInstalled && (
        <div
          className={`absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
          <Button
            onClick={handleInstallCap}
            variant="primary"
            className="gap-2"
          >
            <PackagePlus className="w-4 h-4 text-white" />
            Install
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
      )}
    </Card>
  );
}
