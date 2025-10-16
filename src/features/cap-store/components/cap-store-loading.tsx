import { Card, Skeleton } from '@/shared/components/ui';
import { generateUUID } from '@/shared/utils';

interface CapStoreLoadingProps {
  count?: number;
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

export function CapStoreLoading({ count = 24 }: CapStoreLoadingProps) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 p-6">
      {Array.from({ length: count }, (_, index) => (
        <CapCardSkeleton key={generateUUID()} />
      ))}
    </div>
  );
}
