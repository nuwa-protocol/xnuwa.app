import { Loader2, Package, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/shared/components';
import * as Dialog from '@/shared/components/ui';
import {
  Button,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks/use-language';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { useRemoteCap } from '../hooks/use-remote-cap';
import type { InstalledCap } from '../types';
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
  const [activeTab, setActiveTab] = useState('all');

  const { remoteCaps, isLoading, error, refetch } = useRemoteCap({
    searchQuery,
    category: activeTab === 'all' ? undefined : activeTab,
  });

  const setCurrentCap = CurrentCapStore((state) => state.setCurrentCap);

  const tabs = [
    { id: 'all', label: t('capStore.tabs.all') },
    { id: 'development', label: t('capStore.tabs.development') },
    { id: 'design', label: t('capStore.tabs.design') },
    { id: 'analytics', label: t('capStore.tabs.analytics') },
    { id: 'productivity', label: t('capStore.tabs.productivity') },
    { id: 'security', label: t('capStore.tabs.security') },
  ];

  const handleRunCap = (cap: InstalledCap) => {
    // Set this cap as the current cap
    setCurrentCap({
      id: cap.id,
      name: cap.name,
      prompt: cap.prompt,
      model: cap.model,
      mcpServers: cap.mcpServers,
    });

    onOpenChange?.(false);

    toast({
      type: 'success',
      description: `${cap.name} is now active`,
    });
  };

  return (
    <Dialog.Dialog open={open} onOpenChange={onOpenChange}>
      {children && (
        <Dialog.DialogTrigger asChild>{children}</Dialog.DialogTrigger>
      )}
      <Dialog.DialogContent
        className="fixed left-1/2 top-1/2 z-50 flex flex-col -translate-x-1/2 -translate-y-1/2 gap-0 border bg-background p-0 shadow-lg sm:rounded-lg overflow-hidden"
        style={{
          width: '90vw',
          maxWidth: 1000,
          height: '85vh',
          maxHeight: 800,
          minHeight: 0,
        }}
        aria-describedby={undefined}
      >
        <Dialog.DialogTitle className="sr-only">
          {t('capStore.title')}
        </Dialog.DialogTitle>
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="border-b px-6 py-4 shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <Package className="size-6" />
              <div>
                <h2 className="text-lg font-semibold">{t('capStore.title')}</h2>
                <p className="text-sm text-muted-foreground">
                  {t('capStore.description')}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={t('capStore.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 flex flex-col">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Tab List - Sticky */}
              <div className="shrink-0 border-b px-6 py-3 bg-background">
                <TabsList className="grid w-full grid-cols-6">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="text-xs"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab Content - Scrollable */}
              <div className="flex-1 min-h-0 overflow-auto">
                {tabs.map((tab) => (
                  <TabsContent
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:block data-[state=inactive]:hidden m-0"
                  >
                    <div className="p-6">
                      {error ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                          <Package className="size-12 text-red-500 mb-4" />
                          <h3 className="text-lg font-medium mb-2 text-red-600">
                            {t('capStore.status.error')}
                          </h3>
                          <p className="text-muted-foreground max-w-md mb-4">
                            {t('capStore.status.errorDesc')}
                          </p>
                          <Button variant="outline" onClick={refetch}>
                            {t('capStore.status.tryAgain')}
                          </Button>
                        </div>
                      ) : isLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                          <Loader2 className="size-12 text-muted-foreground mb-4 animate-spin" />
                          <h3 className="text-lg font-medium mb-2">
                            {t('capStore.status.loading')}
                          </h3>
                          <p className="text-muted-foreground max-w-md">
                            {t('capStore.status.fetching')}
                          </p>
                        </div>
                      ) : remoteCaps.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                          <Package className="size-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            {t('capStore.status.noCaps')}
                          </h3>
                          <p className="text-muted-foreground max-w-md">
                            {searchQuery.trim()
                              ? t('capStore.status.noCapsDesc.search')
                              : t('capStore.status.noCapsDesc.category')}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6 min-h-0">
                          {remoteCaps.map((cap) => (
                            <CapCard
                              key={cap.id}
                              cap={cap}
                              onRun={handleRunCap}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </div>
            </Tabs>
          </div>
        </div>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  );
}
