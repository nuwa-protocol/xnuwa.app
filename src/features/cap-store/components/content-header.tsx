import {
  Calendar,
  ChevronDown,
  CloudDownload,
  Heart,
  Search,
  Star,
  UserRoundPen,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Input } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useDebounceValue, useLanguage } from '@/shared/hooks';

interface ContentHeaderProps {
  showSearchAndSort: boolean;
}

export function CapStoreContentHeader({
  showSearchAndSort,
}: ContentHeaderProps) {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearchValue = searchParams.get('search') || '';
  const [searchValue, setSearchValue] = useState(urlSearchValue);
  const [debouncedSearchValue, setDebouncedSearchValue] = useDebounceValue(
    urlSearchValue,
    500,
  );

  const sortBy = searchParams.get('sortBy') || 'downloads';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const sortOptions = [
    { value: 'downloads' as const, label: 'Downloads', icon: CloudDownload },
    { value: 'updated_at' as const, label: 'Updated Time', icon: Calendar },
    { value: 'average_rating' as const, label: 'Rating', icon: Heart },
    { value: 'favorites' as const, label: 'Favorites', icon: Star },
    { value: 'rating_count' as const, label: 'Reviews', icon: UserRoundPen },
  ];

  // Sync debounced search value with URL
  useEffect(() => {
    if (debouncedSearchValue !== urlSearchValue) {
      handleDebouncedSearchChange(debouncedSearchValue);
    }
  }, [debouncedSearchValue]);

  // Update local search when URL changes
  useEffect(() => {
    setSearchValue(urlSearchValue);
  }, [urlSearchValue]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setDebouncedSearchValue(value);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setDebouncedSearchValue('');
    handleDebouncedSearchChange('');
  };

  const handleDebouncedSearchChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('search', value);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  if (!showSearchAndSort) {
    return null;
  }

  return (
    <div className="bg-background/95 backdrop-blur-sm mx-3">
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3 flex-1 justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
            <Input
              placeholder={t('capStore.searchPlaceholder') || 'Search caps...'}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className={`
                pl-9 pr-9 h-10 border-0 bg-accent text-sm
                placeholder:text-muted-foreground/60 
                focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-ring
                transition-all duration-200 ease-out
                ${searchValue ? 'bg-background ring-2 ring-ring/20' : ''}
              `}
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="
                  absolute right-3 top-1/2 -translate-y-1/2 size-4 
                  text-muted-foreground/60 hover:text-foreground 
                  transition-colors duration-200
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm
                "
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground">Sort By:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 px-4 text-sm items-center justify-center font-medium gap-2"
                >
                  {(() => {
                    const option = sortOptions.find(
                      (opt) => opt.value === sortBy,
                    );
                    return (
                      <>
                        <span>{option?.label || 'Sort'}</span>
                        <ChevronDown className="size-4" />
                      </>
                    );
                  })()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {sortOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <DropdownMenuItem
                      key={`${option.value}-desc`}
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams);
                        newParams.set('sortBy', option.value);
                        newParams.set('sortOrder', 'desc');
                        setSearchParams(newParams);
                      }}
                      className={`
                      flex items-center gap-2 cursor-pointer
                      ${sortBy === option.value && sortOrder === 'desc' ? 'bg-accent text-accent-foreground' : ''}
                    `}
                    >
                      <IconComponent className="size-4" />
                      <span className="text-sm">{option.label}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
