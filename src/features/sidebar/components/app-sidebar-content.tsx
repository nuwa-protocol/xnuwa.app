import { Settings2, SparklesIcon, WalletIcon, Wrench } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebarFloating } from '@/features/sidebar/hooks/use-sidebar-floating';
import { WalletStore } from '@/features/wallet/stores';
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
import { SidebarButton } from './sidebar-button';
import { SidebarHistory } from './sidebar-history';
import { SidebarToggle } from './sidebar-toggle';

export function AppSidebarContent() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { setOpenMobile } = useSidebar();
  const { mode: sidebarMode } = useSidebarFloating();
  const floatingContext = useAppSidebar();
  const sidebarVariant = sidebarMode === 'floating' ? 'floating' : 'sidebar';
  const isDevMode = useDevMode();

  const { usdAmount, balanceLoading, balanceError } = WalletStore();

  const usdValue = balanceLoading
    ? 'loading...'
    : balanceError
      ? 'Failed to load balance'
      : `$${usdAmount} USD`;

  const handleNewChat = () => {
    setOpenMobile(false);
    navigate('/chat');
  };

  // Add keyboard shortcut for new chat using manual event listener
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Try Cmd+K/Ctrl+K first
      if (
        event.key === 'k' &&
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey
      ) {
        event.preventDefault();
        handleNewChat();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNewChat]);

  // Get the appropriate keyboard shortcut display based on platform
  const getShortcutDisplay = () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    return isMac ? '⌘K' : 'Ctrl+K';
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
        'group-data-[side=left]:border-r-0',
        // Add smooth transition animations
        'transition-all duration-300 ease-in-out',
        // Custom padding for floating mode
        sidebarMode === 'floating' && '[&>div:last-child]:ml-2',
      )}
      variant={sidebarVariant}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-col gap-2">
            {/* Sidebar Header */}
            <div className="flex justify-between items-center">
              <Logo
                size="md"
                variant="app-brand"
                onClick={() => navigate('/chat')}
                className="rounded-md hover:bg-sidebar-accent"
              />
              <SidebarToggle />
            </div>

            {/* New Chat Button */}
            <SidebarButton
              text={t('nav.sidebar.new')}
              href="/chat"
              variant="primary"
              className="my-2"
              shortcut={getShortcutDisplay()}
            />

            {/* Wallet Button */}
            <SidebarButton
              text={t('nav.sidebar.wallet')}
              icon={WalletIcon}
              href="/wallet"
              variant="secondary"
              endContent={<span className="text-md font-bold">{usdValue}</span>}
            />

            {/* Cap Store Button */}
            <SidebarButton
              text={'Explore'}
              icon={SparklesIcon}
              href="/cap-store"
              variant="secondary"
            />

            {isDevMode && (
              <SidebarButton
                icon={Wrench}
                text={'Cap Studio'}
                href="/cap-studio"
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
        <SidebarButton
          icon={Settings2}
          text={t('nav.sidebar.settings')}
          href="/settings"
          variant="secondary"
        />
      </SidebarFooter>
    </Sidebar>
  );
}
