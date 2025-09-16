import { Card, Skeleton } from '@/shared/components/ui';
import { generateUUID } from '@/shared/utils';

interface CapStoreLoadingProps {
  count?: number;
}

function CapCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-6">
        {/* Avatar skeleton */}
        <Skeleton className="size-24 rounded-md flex-shrink-0" />

        <div className="flex-1 min-w-0 space-y-2">
          {/* Title skeleton */}
          <Skeleton className="h-5 w-24" />

          {/* Description skeleton - multiple lines */}
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* Stats skeleton */}
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1">
              <Skeleton className="size-3" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="size-3" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function CapStoreLoading({ count = 24 }: CapStoreLoadingProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 p-6">
      {Array.from({ length: count }, (_, index) => (
        <CapCardSkeleton key={generateUUID()} />
      ))}
    </div>
  );
}