import { List, Settings, StarIcon } from 'lucide-react';
import type React from 'react';
import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui/sidebar';
import { useDevMode } from '@/shared/hooks';
import { useLocale } from '@/shared/locales/use-locale';
import type { Provider } from '../utils';
import { ProviderAvatar } from './provider-avatar';

interface ModelSelectorSidebarProps {
  selectedTab: string;
  selectedProvider: string | null;
  providers: Provider[];
  onTabChange: (tab: string) => void;
  onProviderChange: (providerId: string) => void;
}

export const ModelSelectorSidebar: React.FC<ModelSelectorSidebarProps> = ({
  selectedTab,
  selectedProvider,
  providers,
  onTabChange,
  onProviderChange,
}) => {
  const { t } = useLocale();
  const isDevMode = useDevMode();

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    onProviderChange('');
  };

  return (
    <Sidebar collapsible="none" className="w-54 flex flex-col">
      <SidebarHeader className="p-4 font-bold">
        {t('aiProvider.sidebar.title')}
      </SidebarHeader>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {isDevMode && (
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={selectedTab === 'auto'}
                  onClick={() => handleTabChange('auto')}
                >
                  <Settings className="h-4 w-4" />
                  <span>{t('aiProvider.sidebar.tabs.auto')}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={selectedTab === 'favorite'}
                onClick={() => handleTabChange('favorite')}
              >
                <StarIcon className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span>{t('aiProvider.sidebar.tabs.favorite')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={selectedTab === 'all'}
                onClick={() => handleTabChange('all')}
              >
                <List className="h-4 w-4" />
                <span>{t('aiProvider.sidebar.tabs.all')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel className="sticky top-0 z-10 pb-2 flex-shrink-0">
          {t('aiProvider.sidebar.tabs.providers')}
        </SidebarGroupLabel>
        <SidebarMenu className="flex h-[calc(80vh-200px)] overflow-auto hide-scrollbar">
          {providers.map((provider) => (
            <SidebarMenuItem key={provider.id}>
              <SidebarMenuButton
                asChild
                isActive={selectedProvider === provider.id}
              >
                <button
                  type="button"
                  onClick={() => {
                    onProviderChange(provider.id);
                    onTabChange('provider');
                  }}
                  className="w-full text-left flex items-center gap-2"
                >
                  <ProviderAvatar provider={provider.id} size="sm" />
                  <span className="truncate">{provider.name}</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </Sidebar>
  );
};
