import {
  ArrowDownWideNarrow,
  ArrowUpDown,
  BookOpen,
  Bot,
  Brain,
  Calendar,
  CloudDownload,
  Code,
  Coins,
  Heart,
  History,
  Home,
  MoreHorizontal,
  Package,
  PenTool,
  Search,
  Star,
  UserRoundPen,
  Wrench,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/shared/components/ui/navigation-menu';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { predefinedTags } from '@/shared/constants/cap';
import { useDebounceValue, useLanguage } from '@/shared/hooks';
import { useCapStore } from '../stores';
import type { CapStoreSection } from '../types';

export function CapStoreHeader({ style }: { style?: React.CSSProperties }) {
  const { t } = useLanguage();
  const { activeSection, setActiveSection } = useCapStore();
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useDebounceValue(
    '',
    500,
  );
  const [sortBy, setSortBy] = useState<
    'average_rating' | 'downloads' | 'favorites' | 'rating_count' | 'updated_at'
  >('downloads');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { fetchCaps } = useCapStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname === '/chat') {
      setActiveSection({
        id: 'home',
        label: 'Home',
        type: 'section',
      });
    }
  }, [pathname]);

  const tagSections: CapStoreSection[] = predefinedTags.map((tag) => ({
    id: tag.toLowerCase().replace(/\s+/g, '-'),
    label: tag,
    type: 'tag' as const,
  }));

  const sortOptions = [
    { value: 'downloads' as const, label: 'Downloads', icon: CloudDownload },
    { value: 'updated_at' as const, label: 'Updated Time', icon: Calendar },
    { value: 'average_rating' as const, label: 'Rating', icon: Heart },
    { value: 'favorites' as const, label: 'Favorites', icon: Star },
    { value: 'rating_count' as const, label: 'Reviews', icon: UserRoundPen },
  ];

  const getSectionIcon = (sectionId: string, type: string) => {
    if (type === 'section') {
      switch (sectionId) {
        case 'favorites':
          return Star;
        case 'recent':
          return History;
        case 'all':
          return Bot;
        default:
          return Package;
      }
    }

    if (type === 'tag') {
      switch (sectionId) {
        case 'ai-model':
          return Brain;
        case 'coding':
          return Code;
        case 'content-writing':
          return PenTool;
        case 'research':
          return BookOpen;
        case 'crypto':
          return Coins;
        case 'tools':
          return Wrench;
        case 'others':
          return MoreHorizontal;
        default:
          return Package;
      }
    }

    return Package;
  };

  // reset search value when active section changes
  useEffect(() => {
    setSearchValue('');
  }, [activeSection]);

  // fetch caps when debounced search value changes
  useEffect(() => {
    handleDebouncedSearchChange(debouncedSearchValue);
  }, [debouncedSearchValue]);

  // fetch caps when sorting changes
  useEffect(() => {
    if (activeSection.id) {
      handleDebouncedSearchChange(searchValue);
    }
  }, [sortBy, sortOrder]);

  // handle search change
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setDebouncedSearchValue(value);
  };

  // handle clear search
  const handleClearSearch = () => {
    setSearchValue('');
    handleDebouncedSearchChange('');
    setDebouncedSearchValue('');
  };



  // handle debounced search change
  const handleDebouncedSearchChange = (value: string) => {
    const searchParams: {
      searchQuery: string;
      sortBy: typeof sortBy;
      sortOrder: typeof sortOrder;
    } = {
      searchQuery: value,
      sortBy,
      sortOrder,
    };

    if (activeSection.type === 'tag') {
      fetchCaps({
        ...searchParams,
        tags: [activeSection.label],
      });
    } else if (activeSection.type === 'section') {
      fetchCaps(searchParams);
    }
  };

  // handle active section change
  const handleActiveSectionChange = (section: CapStoreSection) => {
    setActiveSection(section);
    const searchParams: {
      searchQuery: string;
      sortBy: typeof sortBy;
      sortOrder: typeof sortOrder;
    } = {
      searchQuery: searchValue,
      sortBy,
      sortOrder,
    };

    if (section.type === 'tag') {
      fetchCaps({
        ...searchParams,
        tags: [section.label],
      });
    } else if (section.id === 'all') {
      fetchCaps(searchParams);
    }
    if (pathname === '/chat') {
      navigate('/explore');
    }
  };

  // handle sort change
  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
    const searchParams: {
      searchQuery: string;
      sortBy: typeof newSortBy;
      sortOrder: typeof sortOrder;
    } = {
      searchQuery: searchValue,
      sortBy: newSortBy,
      sortOrder,
    };

    if (activeSection.type === 'tag') {
      fetchCaps({
        ...searchParams,
        tags: [activeSection.label],
      });
    } else if (activeSection.type === 'section') {
      fetchCaps(searchParams);
    }
  };

  return (
    <header className="sticky top-0 z-10" style={style}>
      <div className="relative bg-background/95 backdrop-blur-xl border border-border/50 rounded-t rounded-lg shadow-lg shadow-black/5 supports-[backdrop-filter]:bg-background/80 px-4 py-2 w-full">
        <TooltipProvider>
          <div className="flex items-center gap-8 max-w-7xl mx-auto px-4">
            {/* Navigation Menu - Left Side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Favorites Button - Start of navbar */}
              <button
                type="button"
                onClick={() =>
                  handleActiveSectionChange({
                    id: 'favorites',
                    label: t('capStore.sidebar.favorites') || 'Favorites',
                    type: 'section',
                  })
                }
                className={`
                      inline-flex items-center justify-center p-2 rounded-md
                      transition-all duration-200 ease-out relative
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                      ${activeSection.id === 'favorites'
                    ? 'text-yellow-500 after:absolute after:-bottom-2 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full'
                    : 'text-muted-foreground hover:text-yellow-500 hover:bg-muted/50'
                  }
                    `}
              >
                <Star className="size-5 fill-yellow-500 text-yellow-500" />
              </button>

              <NavigationMenu>
                <NavigationMenuList className="gap-2">
                  {/* Home / Featured Caps */}
                  <NavigationMenuItem>
                    <button
                      type="button"
                      onClick={() =>
                        handleActiveSectionChange({
                          id: 'home',
                          label: 'Home',
                          type: 'section',
                        })
                      }
                      className={`
                            inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md
                            transition-all duration-200 ease-out relative
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                            ${activeSection.id === 'home'
                          ? 'text-primary after:absolute after:-bottom-2 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }
                          `}
                    >
                      <Home className="size-4" />
                      <span>Home</span>
                    </button>
                  </NavigationMenuItem>

                  {/* All with Categories Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={`
                          inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md
                          transition-all duration-200 ease-out relative
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                          data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:shadow-sm
                          ${activeSection.id === 'all' ||
                          activeSection.type === 'tag'
                          ? 'text-primary after:absolute after:-bottom-2 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }
                        `}
                    >
                      {activeSection.type === 'tag' ? (
                        <>
                          {(() => {
                            const IconComponent = getSectionIcon(
                              activeSection.id,
                              activeSection.type,
                            );
                            return <IconComponent className="size-4" />;
                          })()}
                          <span>{activeSection.label}</span>
                        </>
                      ) : (
                        <>
                          <Bot className="size-4" />
                          <span>AI Caps</span>
                        </>
                      )}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="min-w-[240px] p-2 animate-in fade-in-0 zoom-in-95">
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleActiveSectionChange({
                              id: 'all',
                              label: t('capStore.sidebar.all') || 'Caps',
                              type: 'section',
                            })
                          }
                          className={`
                              flex items-center gap-3 px-3 py-2.5 rounded-md text-sm
                              transition-all duration-200
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                              ${activeSection.id === 'all'
                              ? 'bg-gradient-to-r from-primary/15 to-primary/10 text-primary font-medium border border-primary/20 shadow-sm shadow-primary/10'
                              : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                            }
                            `}
                        >
                          <Bot className="size-4 text-muted-foreground" />
                          <span>All Caps</span>
                        </button>

                        <div className="my-2 h-px bg-border" />

                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Categories
                        </div>
                        <div className="space-y-1">
                          {tagSections.map((section) => {
                            const IconComponent = getSectionIcon(
                              section.id,
                              section.type,
                            );
                            const isSelected = activeSection.id === section.id;

                            return (
                              <button
                                type="button"
                                key={section.id}
                                onClick={() =>
                                  handleActiveSectionChange(section)
                                }
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 w-full rounded-md text-sm
                                    transition-all duration-200
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                                    ${isSelected
                                    ? 'bg-gradient-to-r from-primary/15 to-primary/10 text-primary font-medium border border-primary/20 shadow-sm shadow-primary/10'
                                    : 'text-foreground hover:bg-accent/60 hover:text-accent-foreground'
                                  }
                                  `}
                              >
                                <IconComponent className="size-4 text-muted-foreground" />
                                <span>{section.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Search Bar - Center */}
            <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                <Input
                  placeholder={
                    t('capStore.searchPlaceholder') || 'Search caps...'
                  }
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className={`
                        pl-9 pr-9 h-8 border-0 bg-accent text-sm
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
            </div>

            {/* Single Sort Dropdown - Right Side */}
            <div className="flex items-center flex-shrink-0 ml-auto">
              {activeSection.id !== 'favorites' &&
                activeSection.id !== 'home' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-sm items-center justify-center font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        {(() => {
                          const option = sortOptions.find(
                            (opt) => opt.value === sortBy,
                          );
                          const IconComponent = option?.icon || ArrowUpDown;
                          return (
                            <>
                              {option?.label}
                              <ArrowDownWideNarrow className="size-4" />
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
                              handleSortChange(option.value);
                              if (sortOrder !== 'desc') {
                                setSortOrder('desc');
                              }
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
                )}
            </div>
          </div>
        </TooltipProvider>
      </div>
    </header>
  );
}
