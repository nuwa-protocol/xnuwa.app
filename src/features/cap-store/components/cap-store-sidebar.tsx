import {
  BookOpen,
  Bot,
  Code,
  Coins,
  Grid3X3,
  History,
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
import { predefinedTags } from '@/shared/constants/cap';
import { useDebounceValue, useLanguage } from '@/shared/hooks';
import { useRemoteCap } from '../hooks/use-remote-cap';
import type { CapStoreSidebarSection } from '../types';
import { useCapStoreModal } from './cap-store-modal-context';

export function CapStoreSidebar() {
  const { t } = useLanguage();
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue, setDebouncedSearchValue] = useDebounceValue(
    '',
    500,
  );
  const { fetchCaps } = useRemoteCap();
  const { setActiveSection, activeSection } = useCapStoreModal();

  const sidebarSections: CapStoreSidebarSection[] = [
    {
      id: 'favorites',
      label: t('capStore.sidebar.favorites') || 'Favorite Caps',
      type: 'section',
    },
    {
      id: 'recent',
      label: t('capStore.sidebar.recent') || 'Recent Caps',
      type: 'section',
    },
    { id: 'divider1', label: '', type: 'divider' },
    {
      id: 'all',
      label: t('capStore.sidebar.all') || 'All Caps',
      type: 'section',
    },
    ...predefinedTags.map((tag) => ({
      id: tag.toLowerCase().replace(/\s+/g, '-'),
      label: tag,
      type: 'tag' as const,
    })),
  ];

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
  const handleActiveSectionChange = (section: CapStoreSidebarSection) => {
    setActiveSection(section);
    if (section.type === 'tag') {
      fetchCaps({ tags: [section.label] });
    } else if (section.id === 'all') {
      fetchCaps({ searchQuery: '' });
    }
  };

  // useEffect(() => {
  //   handleActiveSectionChange(sidebarSections[3]);
  // }, []);

  return (
    <div className="w-56 border-r bg-background overflow-y-auto shrink-0 flex flex-col">
      {/* Search Section */}
      <div className="p-4 border-b shrink-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Cap Store</span>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder={
                  t('capStore.searchPlaceholder') || 'Search caps...'
                }
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-3 space-y-1">
          {sidebarSections.map((section) => {
            if (section.type === 'divider') {
              return <hr key={section.id} className="my-2 border-border" />;
            }

            const IconComponent = getSectionIcon(section.id, section.type);

            const selected = activeSection.id === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => handleActiveSectionChange(section)}
                className={`w-full text-left px-2.5 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2.5 ${
                  selected
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <IconComponent className="size-4 shrink-0" />
                <span className="truncate">{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
