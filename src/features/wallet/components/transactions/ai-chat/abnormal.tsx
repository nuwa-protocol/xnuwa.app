import { AlertCircle, CircleOff, SearchX } from 'lucide-react';
import { Button } from '@/shared/components';

export function AITransactionSearchEmpty({
    searchTerm,
    setSearchTerm,
    filterDate,
    setFilterDate,
}: {
    searchTerm: string;
    setSearchTerm: (searchTerm: string) => void;
    filterDate: Date | undefined;
    setFilterDate: (filterDate: Date | undefined) => void;
}) {
    return (
        <div className="mx-2 my-4 rounded-xl border bg-muted/30 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <SearchX className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold">No transactions found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or clearing the search.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
                {searchTerm && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchTerm('')}
                    >
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
            </div>
        </div>
    )
}

export function AITransactionEmpty() {
    return (
        <div className="mx-2 my-4 rounded-xl border bg-muted/30 p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <CircleOff className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold">No transactions found</h3>
        </div>
    )
}

export function AITransactionError({
    onRetry,
}: {
    onRetry: () => void;
}) {
    return (
        <div className="mx-2 my-4 rounded-xl border bg-destructive/5 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-base font-semibold">Unable to load transactions</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Something went wrong. Please try again.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
                <Button variant="outline" onClick={() => onRetry()}>
                    Try Again
                </Button>
            </div>
        </div>
    )
}