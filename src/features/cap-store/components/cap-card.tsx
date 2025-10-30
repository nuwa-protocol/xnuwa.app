import type { ReactNode } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CapAvatar } from '@/shared/components/cap-avatar';
import { Card } from '@/shared/components/ui';
import { InstalledCapsStore } from '@/shared/stores/installed-caps-store';
import type { Cap } from '@/shared/types';
import { useCapStore } from '../stores';
import type { RemoteCap } from '../types';
import { CapActionButton } from './cap-action-button';

export interface CapCardProps {
  cap: RemoteCap | Cap;
  actions?: ReactNode;
}

const compactNumberFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatCompactNumber = (value: number) =>
  compactNumberFormatter.format(value);

export function CapCard({ cap, actions }: CapCardProps) {
  const navigate = useNavigate();
  const { installedCaps, updateCap } = InstalledCapsStore();
  const { remoteCaps } = useCapStore();
  const [isUpdating, setIsUpdating] = useState(false);

  const capData = ('capData' in cap ? cap.capData : cap) as Cap;

  const capStats = 'stats' in cap ? cap.stats : undefined;

  const formattedViews = capStats
    ? formatCompactNumber(capStats.downloads)
    : null;
  const formattedInstalls = capStats
    ? formatCompactNumber(capStats.favorites)
    : null;

  const isInstalled = installedCaps.some((c) => c.id === cap.id);
  const isPreinstalled = (capData?.authorDID || '').startsWith(
    'did::preinstalled',
  );
  // Only allow update if installed and present in remote list (avoid preinstalled/local-only items)
  const canUpdate =
    isInstalled && !isPreinstalled && remoteCaps.some((c) => c.id === cap.id);

  const handleUpdate = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!canUpdate || isUpdating) return;
    setIsUpdating(true);
    try {
      const updated = await updateCap(cap.id);
      toast.success(`Updated ${updated.metadata.displayName}`);
    } catch (err) {
      console.error('Failed to update cap:', err);
      toast.error('Failed to update. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Resolve registry address for navigation
  const registryAddress = (cap as RemoteCap).cid || ((): string | undefined => {
    const idStr = String((cap as any).id || '');
    const slash = idStr.indexOf('/');
    if (slash > 0) return idStr.slice(0, slash);
    return undefined;
  })();

  const handleNavigate = () => {
    if (!registryAddress) return; // no-op if we cannot resolve a registry
    const index = cap.id.split('/')[1];
    navigate(`/explore/${registryAddress}/${index}`);
  };

  return (
    <Card
      className="group relative flex flex-col gap-2 overflow-hidden p-4 transition-shadow shadow-lg cursor-pointer hover:shadow-md"
      onClick={handleNavigate}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CapAvatar cap={cap} size="3xl" className="rounded-md" />
          <h3 className="text-xl font-semibold leading-tight text-foreground line-clamp-2">
            {capData.metadata.displayName}
          </h3>
        </div>
        <div className="hidden items-center gap-1 group-hover:flex group-focus-within:flex">
          {actions ?? (
            <div
              className="flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <CapActionButton cap={cap} />
            </div>
          )}
        </div>
      </div>
      <div className="min-h-[3.75rem] my-2">
        {capData.metadata.description ? (
          <p className="text-sm text-muted-foreground leading-5 line-clamp-3">
            {capData.metadata.description}
          </p>
        ) : null}
      </div>

      {/* {capStats && (
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground border-t border-between">
          <span
            className="flex items-center justify-center gap-1 border-r pt-3"
            title="Views"
          >
            <Eye className="size-3 text-muted-foreground" />
            <span className="font-medium text-foreground">
              {formattedViews}
            </span>
          </span>
          <span
            className="flex items-center justify-center gap-1 border-r pt-3 "
            title="Installs"
          >
            <Download className="size-3 text-muted-foreground" />
            <span className="font-medium text-foreground">
              {formattedInstalls}
            </span>
          </span>
          <span
            className="flex items-center justify-center gap-1 pt-3"
            title="Average rating"
          >
            <StarRating
              averageRating={capStats.averageRating}
              userRating={capStats.userRating}
              ratingCount={capStats.ratingCount}
              size={14}
            />
          </span>
        </div>
      )} */}
    </Card>
  );
}
