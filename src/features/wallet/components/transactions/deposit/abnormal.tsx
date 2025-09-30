import { AlertCircle, CircleOff, SearchX } from 'lucide-react';
import { Button } from '@/shared/components';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { generateUUID } from '@/shared/utils';

export function DepositSearchEmpty({
  searchTerm,
  setSearchTerm,
  filterDate,
  setFilterDate,
  status,
  setStatus,
}: {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterDate: Date | undefined;
  setFilterDate: (v: Date | undefined) => void;
  status: string;
  setStatus: (v: string) => void;
}) {
  return (
    <div className="mx-2 my-4 rounded-xl border bg-muted/30 p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <SearchX className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">No orders found</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Try adjusting your filters or clearing the search.
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        {searchTerm && (
          <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
            Clear Search
          </Button>
        )}
        {filterDate && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterDate(undefined)}
          >
            Clear Date
          </Button>
        )}
        {status !== 'all' && (
          <Button variant="outline" size="sm" onClick={() => setStatus('all')}>
            Clear Status
          </Button>
        )}
      </div>
    </div>
  );
}

export function DepositEmpty({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-2 my-4 rounded-xl border bg-muted/30 p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <CircleOff className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold">No orders found</h3>
      <div className="mt-4 flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  );
}

export function DepositError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-2 my-4 rounded-xl border bg-destructive/5 p-6 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-base font-semibold">Unable to load orders</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Something went wrong. Please try again.
      </p>
      <div className="mt-4 flex items-center justify-center gap-2">
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      </div>
    </div>
  );
}

export function DepositLoading() {
  return (
    <div className="mx-2 my-4 rounded-xl border bg-muted/30 p-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-1/3" />
        {[...Array(4)].map((_, i) => (
          <div
            key={generateUUID()}
            className="flex items-center justify-between gap-4"
          >
            <div className="flex-1">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <div className="text-right">
              <Skeleton className="h-4 w-24 mb-2 ml-auto" />
              <Skeleton className="h-5 w-20 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
