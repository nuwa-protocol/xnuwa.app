'use client';

import { Bug, Package, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CapStoreModal } from '@/features/cap/components';
import { useSidebarFloating } from '@/features/sidebar/hooks/use-sidebar-floating';
import { Logo } from '@/shared/components';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/shared/components/ui';
import { useDevMode } from '@/shared/hooks';
import { useLanguage } from '@/shared/hooks/use-language';
import { cn } from '@/shared/utils';
import { useAppSidebar } from './app-sidebar';
import { SearchModal } from './search-modal';
import { SettingsDropdown } from './settings-dropdown';
import { SidebarButton } from './sidebar-button';
import { SidebarHistory } from './sidebar-history';
import { SidebarToggle } from './sidebar-toggle';

export function MainContent() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { setOpenMobile } = useSidebar();
  const { mode: sidebarMode } = useSidebarFloating();
  const floatingContext = useAppSidebar();
  const sidebarVariant = sidebarMode === 'floating' ? 'floating' : 'sidebar';
  const isDevMode = useDevMode();

  const handleNewChat = () => {
    setOpenMobile(false);
    navigate('/chat');
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
    <Sidebar
      className={cn(
        'group-data-[side=left]:border-r-0 min-w-[250px]',
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
            {isDevMode && (
              <CapStoreModal>
                <SidebarButton
                  icon={Package}
                  text={t('nav.sidebar.capStore')}
                  variant="secondary"
                />
              </CapStoreModal>
            )}
            {isDevMode && (
              <SidebarButton
                icon={Bug}
                text={'MCP Debug'}
                onClick={() => {
                  navigate('/mcp-debug');
                }}
                variant="secondary"
              />
            )}
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="mt-2">
        <SidebarHistory />
      </SidebarContent>
      <SidebarFooter>
        <SettingsDropdown />
      </SidebarFooter>
    </Sidebar>
  );
}
