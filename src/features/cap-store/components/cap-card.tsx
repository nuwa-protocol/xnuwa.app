import {
  Clock,
  Download,
  Heart,
  Loader2,
  MoreHorizontal,
  Share,
  Star,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui';
import { ShareDialog } from '@/shared/components/ui/shadcn-io/share-dialog';
import { APP_URL } from '@/shared/config/app';
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
  const {
    addCapToFavorite,
    removeCapFromFavorite,
    removeCapFromRecents,
    isCapFavorite,
  } = useCapStore();
  const [isLoading, setIsLoading] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [descriptionClamp, setDescriptionClamp] = useState<number>(2);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const { downloadCap } = useRemoteCap();
  const { activeSection, setSelectedCap } = useCapStoreContext();
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

  const handleCapClick = async (cap: InstalledCap | RemoteCap) => {
    const id = 'metadata' in cap ? cap.id : cap.capData.id;
    const installedCap = installedCaps[id];
    if (installedCap) {
      setSelectedCap(installedCap);
    } else {
      if ('id' in cap) {
        setIsLoading(true);
        try {
          const downloadedCap = await downloadCap(cap as RemoteCap);
          setSelectedCap(downloadedCap);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const getCapActions = (cap: InstalledCap | RemoteCap) => {
    const actions = [];

    const isRemoteCap = 'id' in cap;
    const id = isRemoteCap ? cap.id : cap.capData.id;

    if (isCapFavorite(id)) {
      actions.push({
        icon: <Star className="size-4" />,
        label: 'Remove from Favorites',
        onClick: () => removeCapFromFavorite(id),
      });
    } else {
      actions.push({
        icon: <Star className="size-4" />,
        label: 'Add to Favorites',
        onClick: () => addCapToFavorite(id, cap.version, cap.cid, cap.stats),
      });
    }

    if (activeSection.id === 'recent') {
      actions.push({
        icon: <Clock className="size-4" />,
        label: 'Remove from Recents',
        onClick: () => removeCapFromRecents(id),
      });
    }

    actions.push({
      icon: <Share className="size-4" />,
      label: 'Share',
      onClick: () => setShareDialogOpen(true),
    });

    return actions;
  };

  const capMetadata = 'metadata' in cap ? cap.metadata : cap.capData.metadata;
  const capStats = 'stats' in cap ? cap.stats : null;

  const actions = getCapActions(cap);

  return (
    <Card
      className={`p-4 hover:shadow-md transition-shadow cursor-pointer hover:scale-105 hover:shadow-lg transition-all ${isLoading ? 'opacity-75 pointer-events-none' : ''}`}
      onClick={() => handleCapClick(cap)}
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
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-1.5 hover:bg-muted rounded-sm transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  <span className="sr-only">More Actions</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {actions?.map((action) => (
                  <DropdownMenuItem
                    key={action.label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => e.stopPropagation()}
                    onSelect={() => action.onClick()}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <ShareDialog
              open={shareDialogOpen}
              onOpenChange={setShareDialogOpen}
              title={`Share ${capMetadata.displayName}`}
              description="Share this cap with others"
              links={[
                {
                  id: 'cap-link',
                  label: 'Cap Link',
                  url: `${APP_URL}/chat?capid=${'id' in cap ? cap.id : cap.capData.id}`,
                },
              ]}
            />
          </>
        )}
      </div>
    </Card>
  );
}
