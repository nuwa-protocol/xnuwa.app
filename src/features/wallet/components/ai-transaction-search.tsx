import { Search, X } from 'lucide-react';
import { Button, Input } from '@/shared/components';


export function AITransactionSearch({
    searchTerm,
    setSearchTerm,
}: {
    searchTerm: string;
    setSearchTerm: (searchTerm: string) => void;
}) {
    return (
        <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder="Search transactions..."
                className="h-10 rounded-md pl-9 pr-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}