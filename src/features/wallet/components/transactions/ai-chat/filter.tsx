import {
  CalendarArrowDown,
  CalendarArrowUp,
  CalendarIcon,
  ListFilter,
  SortAsc,
  X,
} from 'lucide-react';
import type { SortOption } from '@/features/wallet/types';
import { Button } from '@/shared/components/ui/button';
import { Calendar } from '@/shared/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';

export const AITransactionsFilter = ({
  sortBy,
  setSortBy,
  filterDate,
  setFilterDate,
}: {
  sortBy: SortOption;
  setSortBy: (sortBy: SortOption) => void;
  filterDate: Date | undefined;
  setFilterDate: (filterDate: Date | undefined) => void;
}) => {
  const clearDateFilter = () => {
    setFilterDate(undefined);
  };

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
      <DropdownMenuContent align="end" className="w-48">
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
          Most Cost
          {sortBy === 'amount-desc' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setSortBy('amount-asc')}>
          <SortAsc className="h-4 w-4 rotate-180 mr-2" />
          Least Cost
          {sortBy === 'amount-asc' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>

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
          <DropdownMenuItem onClick={clearDateFilter}>
            <X className="h-4 w-4 mr-2" />
            Clear date filter
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
