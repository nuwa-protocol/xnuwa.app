'use client';

import { useState } from 'react';
import {
  Package,
  Search,
  Download,
  Check,
  Loader2,
  AlertCircle,
  Power,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as Dialog from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

import { useInstalledCaps } from '@/hooks/use-caps-installed';
import { useCapRemote } from '@/hooks/use-cap-remote';
import type { RemoteCap, InstalledCap } from '@/lib/cap';
import { useLanguage } from '@/hooks/use-language';

interface CapStoreModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

// Combined cap data: remote + local state
interface CapDisplayData {
  remote: RemoteCap;
  local?: InstalledCap;
  isInstalled: boolean;
  isEnabled: boolean;
  hasUpdate: boolean;
  installedVersion?: string;
}

export function CapStoreModal({
  open,
  onOpenChange,
  children,
}: CapStoreModalProps) {
  const { t } = useLanguage();
  const {
    installCap,
    uninstallCap,
    isCapInstalled,
    getInstalledCap,
    isCapEnabled,
    enableCap,
    disableCap,
  } = useInstalledCaps();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { remoteCaps, isLoading, error, refetch } = useCapRemote({
    searchQuery,
    category: activeTab,
  });

  const tabs = [
    { id: 'all', label: t('capStore.tabs.all') },
    { id: 'development', label: t('capStore.tabs.development') },
    { id: 'design', label: t('capStore.tabs.design') },
    { id: 'analytics', label: t('capStore.tabs.analytics') },
    { id: 'productivity', label: t('capStore.tabs.productivity') },
    { id: 'security', label: t('capStore.tabs.security') },
  ];

  // Combine remote caps with local state
  const capDisplayData: CapDisplayData[] = remoteCaps.map((remoteCap) => {
    const isInstalled = isCapInstalled(remoteCap.id);
    const localCap = getInstalledCap(remoteCap.id);
    const isEnabled = isCapEnabled(remoteCap.id);
    const hasUpdate =
      isInstalled && localCap ? localCap.version !== remoteCap.version : false;

    return {
      remote: remoteCap,
      local: localCap || undefined,
      isInstalled,
      isEnabled,
      hasUpdate,
      installedVersion: localCap?.version,
    };
  });

  const handleInstallCap = (remoteCap: RemoteCap) => {
    // Convert RemoteCap to the format needed for installation
    installCap({
      id: remoteCap.id,
      name: remoteCap.name,
      tag: remoteCap.tag,
      description: remoteCap.description,
      version: remoteCap.version,
    });
  };

  const handleUninstallCap = (capId: string) => {
    uninstallCap(capId);
  };

  const handleToggleEnable = (capId: string, currentlyEnabled: boolean) => {
    if (currentlyEnabled) {
      disableCap(capId);
    } else {
      enableCap(capId);
    }
  };

  function CapCard({
    capData,
    onInstall,
    onUninstall,
    onToggleEnable,
  }: {
    capData: CapDisplayData;
    onInstall: () => void;
    onUninstall: () => void;
    onToggleEnable: () => void;
  }) {
    const {
      remote,
      local,
      isInstalled,
      isEnabled,
      hasUpdate,
      installedVersion,
    } = capData;
    const [isLoading, setIsLoading] = useState(false);

    const handleInstall = async () => {
      setIsLoading(true);
      try {
        if (isInstalled) {
          onUninstall();
        } else {
          onInstall();
        }
      } finally {
        setIsLoading(false);
      }
    };

    const handleToggleEnable = async () => {
      if (isInstalled) {
        onToggleEnable();
      }
    };

    return (
      <Card className="p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarImage
              src={`https://avatar.vercel.sh/${remote.name}`}
              alt={remote.name}
            />
            <AvatarFallback>
              {remote.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-sm truncate">{remote.name}</h3>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  {remote.tag}
                </Badge>
                {isInstalled && !isEnabled && (
                  <Badge variant="outline" className="text-xs text-orange-600">
                    {t('capStore.card.disabled')}
                  </Badge>
                )}
                {hasUpdate && (
                  <Badge variant="destructive" className="text-xs">
                    {t('capStore.card.update')}
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {remote.description}
            </p>

            {/* Version and metadata info */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Download className="size-3" />
                <span>{remote.downloads.toLocaleString()}</span>
              </div>
              {isInstalled && installedVersion ? (
                <span className="text-xs">
                  {hasUpdate
                    ? `v${installedVersion} → v${remote.version}`
                    : `v${installedVersion}`}
                </span>
              ) : (
                <span className="text-xs">
                  {t('capStore.card.version', { version: remote.version })}
                </span>
              )}
              {remote.author && (
                <span className="text-xs">
                  {t('capStore.card.by', { author: remote.author })}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Install/Uninstall button */}
                <Button
                  size="sm"
                  variant={isInstalled ? 'default' : 'outline'}
                  className="text-xs px-2 py-1 h-6"
                  onClick={handleInstall}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : isInstalled ? (
                    <>
                      <Check className="size-3 mr-1" />
                      {t('capStore.card.installed')}
                    </>
                  ) : (
                    t('capStore.card.install')
                  )}
                </Button>

                {/* Enable/Disable button (only show if installed) */}
                {isInstalled && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs px-2 py-1 h-6"
                    onClick={handleToggleEnable}
                  >
                    <Power
                      className={`size-3 ${isEnabled ? 'text-green-600' : 'text-gray-400'}`}
                    />
                  </Button>
                )}

                {/* Update indicator */}
                {hasUpdate && (
                  <AlertCircle className="size-3 text-orange-500" />
                )}
              </div>

              {/* Install date (if installed) */}
              {isInstalled && local?.installDate && (
                <span className="text-xs text-muted-foreground">
                  {t('capStore.card.installDate', {
                    date: new Date(local.installDate).toLocaleDateString(),
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Dialog.Dialog
      {...(open !== undefined && onOpenChange ? { open, onOpenChange } : {})}
    >
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
                      ) : capDisplayData.length === 0 ? (
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
                          {capDisplayData.map((capData) => (
                            <CapCard
                              key={capData.remote.id}
                              capData={capData}
                              onInstall={() => handleInstallCap(capData.remote)}
                              onUninstall={() =>
                                handleUninstallCap(capData.remote.id)
                              }
                              onToggleEnable={() =>
                                handleToggleEnable(
                                  capData.remote.id,
                                  capData.isEnabled,
                                )
                              }
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
