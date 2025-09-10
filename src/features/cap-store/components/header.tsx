import {
  BookOpen,
  Bot,
  Code,
  Coins,
  Grid3X3,
  History,
  Home,
  MoreHorizontal,
  Package,
  PenTool,
  Search,
  Star,
  Wrench,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '@/shared/components/ui';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/shared/components/ui/navigation-menu';
import { predefinedTags } from '@/shared/constants/cap';
import { useDebounceValue, useLanguage } from '@/shared/hooks';
import { useCapStoreContext } from '../context';
import { useRemoteCap } from '../hooks/use-remote-cap';
import type { CapStoreSection } from '../types';

export function CapStoreHeader() {
  const { t } = useLanguage();
  const { activeSection, setActiveSection } =
    useCapStoreContext();
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useDebounceValue(
    '',
    500,
  );
  const { fetchCaps } = useRemoteCap();

  const tagSections: CapStoreSection[] = predefinedTags.map((tag) => ({
    id: tag.toLowerCase().replace(/\s+/g, '-'),
    label: tag,
    type: 'tag' as const,
  }));

  const getSectionIcon = (sectionId: string, type: string) => {
    if (type === 'section') {
      switch (sectionId) {
        case 'favorites':
          return Star;
        case 'recent':
          return History;
        case 'all':
          return Grid3X3;
        default:
          return Package;
      }
    }

    if (type === 'tag') {
      switch (sectionId) {
        case 'ai-model':
          return Bot;
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
    if (activeSection.type === 'tag') {
      fetchCaps({
        searchQuery: debouncedSearchValue,
        tags: [activeSection.label],
      });
    } else if (activeSection.type === 'section') {
      fetchCaps({ searchQuery: debouncedSearchValue });
    }
  };

  // handle active section change
  const handleActiveSectionChange = (section: CapStoreSection) => {
    setActiveSection(section);
    if (section.type === 'tag') {
      fetchCaps({ tags: [section.label] });
    } else if (section.id === 'all') {
      fetchCaps({ searchQuery: '' });
    }
  };

  return (
    <div className="border-b border-muted-foreground/20 bg-background">
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Navigation Menu - Left Side */}
          <NavigationMenu>
            <NavigationMenuList>

              {/* Home / Featured Caps */}
              <NavigationMenuItem key="home">
                <button
                  type="button"
                  onClick={() => handleActiveSectionChange({ id: 'home', label: 'Home', type: 'section' })}
                  className={`h-12 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 hover:bg-accent hover:text-accent-foreground hover:rounded-md ${activeSection.id === 'home' ? 'bg-accent text-accent-foreground rounded-md' : ''
                    }`}
                >
                  <Home className="size-4" />
                  {'Home'}
                </button>
              </NavigationMenuItem>

              {/* All Caps with Categories Dropdown */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`h-12 hover:bg-accent hover:text-accent-foreground hover:rounded-md ${activeSection.id === 'all' || activeSection.type === 'tag' ? 'bg-accent text-accent-foreground rounded-md' : ''
                  }`}>
                  {activeSection.type === 'tag' ? (
                    <>
                      {(() => {
                        const IconComponent = getSectionIcon(activeSection.id, activeSection.type);
                        return <IconComponent className="size-4 mr-2" />;
                      })()}
                      {activeSection.label}
                    </>
                  ) : (
                    <>
                      <Grid3X3 className="size-4 mr-2" />
                      All Caps
                    </>
                  )}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="flex flex-col gap-1 p-4 w-[200px]">
                    <button
                      type="button"
                      onClick={() => handleActiveSectionChange({ id: 'all', label: t('capStore.sidebar.all') || 'All Caps', type: 'section' })}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-md text-sm mb-2
                        transition-colors hover:bg-accent hover:text-accent-foreground
                        ${activeSection.id === 'all' ? 'bg-accent text-accent-foreground' : ''}
                      `}
                    >
                      <Grid3X3 className="size-4" />
                      <span className="font-medium">All Caps</span>
                    </button>
                    <div className="border-b border-muted-foreground/20 mb-2" />
                    {tagSections.map((section) => {
                      const IconComponent = getSectionIcon(section.id, section.type);
                      const isSelected = activeSection.id === section.id;

                      return (
                        <button
                          type="button"
                          key={section.id}
                          onClick={() => handleActiveSectionChange(section)}
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-md text-sm
                            transition-colors hover:bg-accent hover:text-accent-foreground
                            ${isSelected ? 'bg-accent text-accent-foreground' : ''}
                          `}
                        >
                          <IconComponent className="size-4" />
                          <span className="font-medium">{section.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Favorites and Recent Buttons */}
              <NavigationMenuItem key="favorites">
                <button
                  type="button"
                  onClick={() => handleActiveSectionChange({ id: 'favorites', label: t('capStore.sidebar.favorites') || 'Favorites', type: 'section' })}
                  className={`h-12 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 hover:bg-accent hover:text-accent-foreground hover:rounded-md ${activeSection.id === 'favorites' ? 'bg-accent text-accent-foreground rounded-md' : ''
                    }`}
                >
                  <Star className="size-4" />
                  {t('capStore.sidebar.favorites') || 'Favorites'}
                </button>
              </NavigationMenuItem>

              <NavigationMenuItem key="recent">
                <button
                  type="button"
                  onClick={() => handleActiveSectionChange({ id: 'recent', label: t('capStore.sidebar.recent') || 'Recent', type: 'section' })}
                  className={`h-12 px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 hover:bg-accent hover:text-accent-foreground hover:rounded-md ${activeSection.id === 'recent' ? 'bg-accent text-accent-foreground rounded-md' : ''
                    }`}
                >
                  <History className="size-4" />
                  {t('capStore.sidebar.recent') || 'Recent'}
                </button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Search Bar - Right Side */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={t('capStore.searchPlaceholder') || 'Search caps...'}
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 h-10"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
