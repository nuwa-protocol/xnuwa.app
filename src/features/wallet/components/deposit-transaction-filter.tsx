import {
  CalendarArrowDown,
  CalendarArrowUp,
  CalendarIcon,
  Check,
  ListFilter,
  SortAsc,
  X,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import type { SortOption } from '../types';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export function DepositTransactionsFilter({
  sortBy,
  setSortBy,
  filterDate,
  setFilterDate,
  status,
  setStatus,
}: {
  sortBy: SortOption;
  setSortBy: (v: SortOption) => void;
  filterDate: Date | undefined;
  setFilterDate: (v: Date | undefined) => void;
  status: string;
  setStatus: (v: string) => void;
}) {
  const clearDate = () => setFilterDate(undefined);
  const clearStatus = () => setStatus('all');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 rounded-md px-3 gap-2"
        >
          <ListFilter className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setSortBy('time-desc')}>
          <CalendarArrowDown className="h-4 w-4 mr-2" />
          Latest
          {sortBy === 'time-desc' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSortBy('time-asc')}>
          <CalendarArrowUp className="h-4 w-4 mr-2" />
          Earliest
          {sortBy === 'time-asc' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSortBy('amount-desc')}>
          <SortAsc className="h-4 w-4 mr-2" />
          Highest Amount
          {sortBy === 'amount-desc' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSortBy('amount-asc')}>
          <SortAsc className="h-4 w-4 rotate-180 mr-2" />
          Lowest Amount
          {sortBy === 'amount-asc' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44">
            {STATUS_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => setStatus(opt.value)}
              >
                {status === opt.value ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <span className="w-4 h-4 mr-2" />
                )}
                {opt.label}
              </DropdownMenuItem>
            ))}
            {status !== 'all' && (
              <DropdownMenuItem onClick={clearStatus}>
                <X className="h-4 w-4 mr-2" />
                Clear status filter
              </DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Filter by date</DropdownMenuLabel>
        <div className="px-2 py-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterDate ? filterDate.toLocaleDateString() : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end" side="right">
              <Calendar
                mode="single"
                selected={filterDate}
                onSelect={setFilterDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {filterDate && (
          <DropdownMenuItem onClick={clearDate}>
            <X className="h-4 w-4 mr-2" />
            Clear date filter
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
