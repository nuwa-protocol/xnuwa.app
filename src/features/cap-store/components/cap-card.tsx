import { Clock, Loader2, MoreHorizontal, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui';
import type { Cap } from '@/shared/types/cap';
import { useCapStore } from '../hooks/use-cap-store';
import { useRemoteCap } from '../hooks/use-remote-cap';
import type { RemoteCap } from '../types';
import { CapAvatar } from './cap-avatar';
import { useCapStoreModal } from './cap-store-modal-context';

export interface CapCardProps {
  cap: Cap | RemoteCap;
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

  const { downloadCap } = useRemoteCap();
  const { activeSection, setSelectedCap } = useCapStoreModal();
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

  const handleCapClick = async (cap: Cap | RemoteCap) => {
    const installedCap = installedCaps[cap.id];
    if (installedCap) {
      setSelectedCap(installedCap);
    } else {
      if ('cid' in cap) {
        setIsLoading(true);
        try {
          const downloadedCap = await downloadCap(cap);
          setSelectedCap(downloadedCap);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const getCapActions = (cap: Cap | RemoteCap) => {
    const actions = [];

    const isRemoteCap = 'cid' in cap;

    if (isCapFavorite(cap.id)) {
      actions.push({
        icon: <Star className="size-4" />,
        label: 'Remove from Favorites',
        onClick: () => removeCapFromFavorite(cap.id),
      });
    } else {
      actions.push({
        icon: <Star className="size-4" />,
        label: 'Add to Favorites',
        onClick: () =>
          addCapToFavorite(cap.id, isRemoteCap ? cap.cid : undefined),
      });
    }

    if (activeSection.id === 'recent') {
      actions.push({
        icon: <Clock className="size-4" />,
        label: 'Remove from Recents',
        onClick: () => removeCapFromRecents(cap.id),
      });
    }

    return actions;
  };

  const capMetadata = cap.metadata;

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
        </div>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
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
        )}
      </div>
    </Card>
  );
}
