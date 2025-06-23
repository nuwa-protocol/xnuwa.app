'use client';

import { cn } from '@/utils';
import { useRouter } from 'next/navigation';
import { Search, Settings, Folder, Package } from 'lucide-react';

import { SearchModal } from '@/components/search-modal';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { SidebarHistory } from '@/components/sidebar-history';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import { SidebarButton } from '@/components/ui/sidebar-button';
import { useFloatingSidebar } from '@/components/floating-sidebar';
import { Logo } from '@/components/logo';
import { SettingsModal } from '@/components/settings-modal';
import { CapStoreModal } from '@/components/cap-store-modal';

import { useSidebarSettings } from '@/hooks/use-settings-sidebar';
import { useLanguage } from '@/hooks/use-language';

export function AppSidebar() {
  const router = useRouter();
  const { t } = useLanguage();
  const { setOpenMobile } = useSidebar();
  const { mode: sidebarMode } = useSidebarSettings();
  const floatingContext = useFloatingSidebar();
  const sidebarVariant = sidebarMode === 'floating' ? 'floating' : 'sidebar';

  const handleNewChat = () => {
    setOpenMobile(false);
    router.push('/chat');
  };

  const handleMouseEnter = () => {
    if (sidebarMode === 'floating' && floatingContext) {
      floatingContext.setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    if (sidebarMode === 'floating' && floatingContext) {
      floatingContext.setIsHovering(false);
    }
  };

  return (
    <>
      <Sidebar
        className={cn(
          'group-data-[side=left]:border-r-0',
          // Add smooth transition animations
          'transition-all duration-300 ease-in-out',
        )}
        variant={sidebarVariant}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <SidebarHeader>
          <SidebarMenu>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <Logo />
                <SidebarToggle />
              </div>
              <SidebarButton
                text={t('nav.sidebar.new')}
                onClick={handleNewChat}
                variant="primary"
                className="my-2"
              />
              <SearchModal>
                <SidebarButton
                  icon={Search}
                  text={t('nav.sidebar.search')}
                  variant="secondary"
                />
              </SearchModal>
              <CapStoreModal>
                <SidebarButton
                  icon={Package}
                  text={t('nav.sidebar.capStore')}
                  variant="secondary"
                />
              </CapStoreModal>
              <SidebarButton
                icon={Folder}
                text={t('nav.sidebar.artifact')}
                onClick={() => {}}
                variant="secondary"
              />
            </div>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="mt-2">
          <SidebarHistory />
        </SidebarContent>
        <SidebarFooter>
          <SettingsModal>
            <SidebarButton
              icon={Settings}
              text={t('nav.sidebar.settings')}
              variant="secondary"
            />
          </SettingsModal>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
