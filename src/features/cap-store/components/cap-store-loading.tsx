import { Card, Skeleton, Button } from '@/shared/components/ui';
import { Loader2, ExternalLink } from 'lucide-react';
import { generateUUID } from '@/shared/utils';
import { DEFAULT_IDENTITY_REGISTRY_ADDRESS } from '@/erc8004/8004-service';
import {
  DEFAULT_REGISTRY,
  getRegistryByAddress,
  buildExplorerAddressUrlFromRegistry,
} from '@/erc8004/8004-registries';

interface CapStoreLoadingProps {
  count?: number;
  // Optional registry address to build an explorer link. Falls back to default.
  registryAddress?: `0x${string}`;
}

function CapCardSkeleton() {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar skeleton */}
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="space-y-2">
            {/* Title skeleton */}
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-9 w-[110px]" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="min-h-[3.75rem] space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="size-3" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="size-3" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Skeleton className="size-3 rounded-full" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </Card>
  );
}

export function CapStoreLoading({ count = 24, registryAddress }: CapStoreLoadingProps) {
  // Determine explorer link for the provided or default registry address.
  const address = (registryAddress || DEFAULT_IDENTITY_REGISTRY_ADDRESS) as `0x${string}`;
  const registry = getRegistryByAddress(address) || DEFAULT_REGISTRY;
  const explorerUrl = registry
    ? buildExplorerAddressUrlFromRegistry(registry, address)
    : `https://etherscan.io/address/${address}`;

  return (
    <div className="w-full p-6 space-y-6">
      {/* Top notice: on-chain load can be slow and an explorer shortcut */}
      <div className="flex items-start justify-between gap-4 rounded-md border p-4">
        <div className="flex items-start gap-3">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-theme-primary" />
          <div>
            <p className="text-sm font-medium">Loading from on-chain registry…</p>
            <p className="text-xs text-muted-foreground">
              This may take a while. If this looks stuck, try refreshing the page.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={explorerUrl} target="_blank" rel="noreferrer">
            View Registry on Explorer
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </div>

      {/* Skeleton grid while fetching caps */}
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {Array.from({ length: count }, () => (
          <CapCardSkeleton key={generateUUID()} />
        ))}
      </div>
    </div>
  );
}
