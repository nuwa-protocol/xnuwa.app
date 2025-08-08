import {
  BookOpen,
  Bot,
  Code,
  Coins,
  Download,
  Grid3X3,
  Loader2,
  MoreHorizontal,
  Package,
  PenTool,
  RefreshCw,
  Search,
  Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as Dialog from '@/shared/components/ui';
import { Button, Input } from '@/shared/components/ui';
import { predefinedTags } from '@/shared/constants/cap';
import { useCurrentCap, useLanguage } from '@/shared/hooks';
import type { Cap } from '@/shared/types/cap';
import { useRemoteCap } from '../hooks/use-remote-cap';
import { CapStateStore } from '../stores';
import { CapCard } from './cap-card';

interface CapStoreModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function CapStoreModal({
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
  children,
}: CapStoreModalProps) {
  const { t } = useLanguage();
  const [internalOpen, setInternalOpen] = useState(false);

  // Use external or internal state management
  const isControlled = externalOpen !== undefined;
  const open = isControlled ? externalOpen : internalOpen;
  const onOpenChange = isControlled ? externalOnOpenChange : setInternalOpen;

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('all');

  // State for installed caps
  const [installedCaps, setInstalledCaps] = useState<Cap[]>([]);

  const { remoteCaps, isLoading, error, refetch, lastSearchQuery } =
    useRemoteCap();

  const { setCurrentCap } = useCurrentCap();

  // Subscribe to installed caps changes
  useEffect(() => {
    const updateInstalledCaps = () => {
      const state = CapStateStore.getState();
      const installed: Cap[] = Object.values(state.installedCaps);
      setInstalledCaps(installed);
    };

    // Initial load
    updateInstalledCaps();

    // Subscribe to changes
    const unsubscribe = CapStateStore.subscribe(updateInstalledCaps);

    return unsubscribe;
  }, []);

  const sidebarSections = [
    {
      id: 'installed',
      label: t('capStore.sidebar.installed') || 'Installed',
      type: 'section',
    },
    {
      id: 'all',
      label: t('capStore.sidebar.all') || 'All Caps',
      type: 'section',
    },
    { id: 'divider', label: '', type: 'divider' },
    ...predefinedTags.map((tag) => ({
      id: tag.toLowerCase().replace(/\s+/g, '-'),
      label: tag,
      type: 'tag' as const,
    })),
  ];

  const handleRunCap = (cap: Cap) => {
    // Set this cap as the current cap
    setCurrentCap(cap);

    onOpenChange?.(false);

    toast.success(`${cap.metadata.displayName} has been selected`);
  };

  const handleSearch = () => {
    refetch(searchQuery);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const renderContent = () => {
    // Determine which caps to display based on active section
    const getDisplayCaps = (): Cap[] => {
      if (activeSection === 'installed') {
        return installedCaps;
      } else if (activeSection === 'all') {
        return remoteCaps;
      } else {
        // Filter by tag
        const tagName = activeSection.replace(/-/g, ' ').toLowerCase();
        return remoteCaps.filter((cap) =>
          cap.metadata.tags.some((tag) => tag.toLowerCase() === tagName),
        );
      }
    };

    const displayCaps = getDisplayCaps();
    const isShowingInstalled = activeSection === 'installed';

    if (error && !isShowingInstalled) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Package className="size-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-red-600">
            {t('capStore.status.error')}
          </h3>
          <p className="text-muted-foreground max-w-md mb-4">
            {t('capStore.status.errorDesc')}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            {t('capStore.status.tryAgain')}
          </Button>
        </div>
      );
    }

    if (isLoading && !isShowingInstalled) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Loader2 className="size-12 text-muted-foreground mb-4 animate-spin" />
          <h3 className="text-lg font-medium mb-2">
            {t('capStore.status.loading')}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {t('capStore.status.fetching')}
          </p>
        </div>
      );
    }

    if (displayCaps.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Package className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {isShowingInstalled
              ? t('capStore.status.noInstalledCaps') || 'No Installed Caps'
              : t('capStore.status.noCaps')}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {isShowingInstalled
              ? t('capStore.status.noInstalledCapsDesc') ||
                "You haven't installed any caps yet. Browse the store to find caps to install."
              : lastSearchQuery.trim()
                ? t('capStore.status.noCapsDesc.search')
                : t('capStore.status.noCapsDesc.category')}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 min-h-0">
        {displayCaps.map((cap) => (
          <CapCard key={cap.id} cap={cap} onRun={handleRunCap} />
        ))}
      </div>
    );
  };

  const getSectionIcon = (sectionId: string, type: string) => {
    if (type === 'section') {
      switch (sectionId) {
        case 'installed':
          return Download;
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

  return (
    <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
      {children && (
        <Dialog.DialogTrigger asChild>{children}</Dialog.DialogTrigger>
      )}
      <Dialog.DialogContent
        className="fixed left-1/2 top-1/2 z-50 flex flex-col -translate-x-1/2 -translate-y-1/2 gap-0 border bg-background p-0 shadow-lg sm:rounded-lg overflow-hidden [&>button:last-child]:hidden"
        style={{
          width: '90vw',
          maxWidth: 1200,
          height: '85vh',
          maxHeight: 800,
          minHeight: 0,
        }}
        aria-describedby={undefined}
      >
        <Dialog.DialogTitle className="sr-only">
          {t('capStore.title')}
        </Dialog.DialogTitle>

        {/* Header */}
        <div className="border-b px-6 py-4 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <Package className="size-6" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{t('capStore.title')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('capStore.description')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || activeSection === 'installed'}
              className="gap-2"
            >
              <RefreshCw
                className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>

          {/* Search Bar - only show for remote caps */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={t('capStore.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="gap-2"
            >
              <Search className="size-4" />
              Search
            </Button>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex-1 min-h-0 flex">
          {/* Sidebar */}
          <div className="w-56 border-r bg-muted/30 overflow-y-auto shrink-0">
            <div className="p-4">
              <nav className="space-y-1">
                {sidebarSections.map((section) => {
                  if (section.type === 'divider') {
                    return (
                      <hr key={section.id} className="my-3 border-border" />
                    );
                  }

                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                        activeSection === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      {(() => {
                        const IconComponent = getSectionIcon(
                          section.id,
                          section.type,
                        );
                        return <IconComponent className="size-4 shrink-0" />;
                      })()}
                      {section.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="p-6">{renderContent()}</div>
          </div>
        </div>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  );
}
