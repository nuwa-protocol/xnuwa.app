import { Card, Skeleton } from '@/shared/components/ui';

export function CapDetailsLoadingSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 md:p-8 mb-4 hide-scrollbar">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-4 space-y-6">
              {/* Header Section Skeleton */}
              <div className="flex flex-col sm:flex-row gap-6 justify-between items-start">
                <div className="flex gap-6">
                  {/* Avatar skeleton */}
                  <div className="flex-shrink-0">
                    <Skeleton className="w-20 h-20 rounded-xl" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-4">
                    {/* Title and badges skeleton */}
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-64" />
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-6 w-20" />
                    </div>

                    {/* ID skeleton */}
                    <Skeleton className="h-4 w-48" />

                    {/* Tags skeleton */}
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-14" />
                    </div>

                    {/* Action buttons skeleton */}
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </div>
                </div>

                {/* Right side skeleton */}
                <div className="flex flex-col gap-4 items-end">
                  <Skeleton className="h-6 w-40" />
                  <div className="flex gap-6">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>

              {/* Description skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-24" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>

              {/* Configuration skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-20" />
                      <Skeleton className="h-10 w-20" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-3/5" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

