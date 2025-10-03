import {
  ArrowDownWideNarrow,
  BookOpen,
  Bot,
  Brain,
  Calendar,
  CloudDownload,
  Code,
  Coins,
  Heart,
  MoreHorizontal,
  Package,
  PenTool,
  Search,
  Star,
  Tag,
  UserRoundPen,
  Wrench,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
import type { CapStoreSection } from '../types';

export function CapStoreHeader({ style }: { style?: React.CSSProperties }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { pathname } = useLocation();
  const urlSearchValue = searchParams.get('search') || '';
  const [searchValue, setSearchValue] = useState(urlSearchValue);
  const [debouncedSearchValue, setDebouncedSearchValue] = useDebounceValue(
    urlSearchValue,
    500,
  );

  const tagSections: CapStoreSection[] = predefinedTags.map((tag) => ({
    id: tag.toLowerCase().replace(/\s+/g, '-'),
    label: tag,
    type: 'tag' as const,
  }));

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

  const getActiveSection = (): CapStoreSection => {
    const pathSegments = pathname.split('/');
    const path = pathSegments[2]; // Changed from [1] to [2] since explore is at index 1

    // Get tag from URL query
    const tag = searchParams.get('tag');

  // Handle installed route (renamed from favorites)
  if (path === 'installed') {
    return { id: 'installed', label: 'Installed Caps', type: 'section' };
  }

    // Handle caps route with tag
    if (path === 'caps' && tag) {
      // Find the matching tag section
      const tagSection = tagSections.find(
        (section) => section.id === tag.toLowerCase().replace(/\s+/g, '-'),
      );
      if (tagSection) {
        return tagSection;
      }
    }

    // Handle caps route without tag
    if (path === 'caps') {
      return { id: 'all', label: 'All Caps', type: 'section' };
    }

    // Default to all
    return { id: 'all', label: 'All Caps', type: 'section' };
  };

  const activeSection = getActiveSection();
  const sortBy = searchParams.get('sortBy') || 'downloads';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

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
        case 'installed':
          return Package;
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

  // handle search change
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setDebouncedSearchValue(value);
  };

  // handle clear search
  const handleClearSearch = () => {
    setSearchValue('');
    setDebouncedSearchValue('');
    handleDebouncedSearchChange('');
  };

  // handle debounced search change
  const handleDebouncedSearchChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set('search', value);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  // handle active section change
  const handleActiveSectionChange = (section: CapStoreSection) => {
    if (section.id === 'installed') {
      navigate('/explore/installed');
    } else if (section.id === 'all') {
      navigate('/explore/caps');
    } else if (section.type === 'tag') {
      navigate(`/explore/caps?tag=${section.label}`);
    }
  };

  return (
    <header className="sticky top-0 z-10" style={style}>
      <div className="relative bg-background/95 backdrop-blur-xl border border-border/50 rounded-t rounded-lg shadow-lg shadow-black/5 supports-[backdrop-filter]:bg-background/80 px-4 py-2 w-full">
        <TooltipProvider>
          <div className="flex items-center gap-4 max-w-6xl mx-auto px-4">
            {/* Navigation Menu - Left Side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <NavigationMenu>
                <NavigationMenuList className="gap-2">
                  {/* All with Categories Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={`
                          inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md
                          transition-all duration-200 ease-out relative
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                          data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:shadow-sm
                          ${
                            activeSection.id === 'all' ||
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
                          <Tag className="size-4" />
                          <span>Tags</span>
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
                              ${
                                activeSection.id === 'all'
                                  ? 'bg-accent text-accent-foreground font-semibold'
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
                                    ${
                                      isSelected
                                        ? 'bg-accent text-accent-foreground font-semibold'
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

                  {/* Installed - Third menu item (renamed from Favorites) */}
                  <NavigationMenuItem>
                    <button
                      type="button"
                      onClick={() => navigate('/explore/installed')}
                      className={`
                            inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md
                            transition-all duration-200 ease-out relative
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                            ${
                              activeSection.id === 'installed'
                                ? 'text-primary after:absolute after:-bottom-2 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                            }
                          `}
                    >
                      <Package className="size-4" />
                      <span>Installed Caps</span>
                    </button>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right Side - Search Bar and Sort Dropdown */}
            <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
              {/* Search Bar */}
              <div className="relative w-64">
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
              {activeSection.id !== 'installed' && (
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
              )}
            </div>
          </div>
        </TooltipProvider>
      </div>
    </header>
  );
}
