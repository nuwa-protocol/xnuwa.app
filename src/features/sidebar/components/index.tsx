import { motion } from 'framer-motion';
import { Loader2, Plus, Settings, Wallet, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WalletStore } from '@/features/wallet/stores';
import { useDevMode } from '@/shared/hooks';
import { SidebarBody, SidebarProvider, useSidebar } from './sidebar';
import { PrimarySidebarButton, SecondarySidebarButton } from './sidebar-button';
import { SidebarChats } from './sidebar-chats';
import { SidebarLogo } from './sidebar-logo';

export function AppSidebarContent() {
  const navigate = useNavigate();
  const { open } = useSidebar();
  const isDevMode = useDevMode();

  const { usdAmount, balanceLoading, balanceError } = WalletStore();
  const walletBalance = balanceLoading
    ? `$${usdAmount} ${<Loader2 className="size-2 animate-spin" />}`
    : balanceError
      ? 'Failed to load balance'
      : `$${usdAmount} USD`;

  const handleNewChat = () => {
    navigate('/chat');
  };

  return (
    <SidebarBody className="justify-between gap-6">
      <div className="flex flex-1 flex-col overflow-hidden">
        <SidebarLogo />
        <div className="mt-12">
          <PrimarySidebarButton
            icon={<Plus className="size-5 shrink-0" />}
            label="New Chat"
            onClick={handleNewChat}
          />
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <SecondarySidebarButton
            icon={<Wallet className="size-5 shrink-0" />}
            label="Wallet"
            targetPath="/wallet"
            onClick={() => navigate('/wallet')}
            extraElement={
              <motion.span
                animate={{
                  display: open ? 'inline-block' : 'none',
                  opacity: open ? 1 : 0,
                }}
                className="text-sm font-semibold whitespace-pre shrink-0"
              >
                {walletBalance}
              </motion.span>
            }
          />
          {/* <SecondarySidebarButton
            icon={<Compass className="size-5 shrink-0" />}
            label="Explore"
            targetPath="/explore"
            onClick={() => navigate('/explore')}
          /> */}
          {isDevMode && (
            <SecondarySidebarButton
              icon={<Wrench className="size-5 shrink-0" />}
              label="Cap Studio"
              targetPath="/cap-studio"
              onClick={() => navigate('/cap-studio')}
            />
          )}
        </div>
        <SidebarChats />
      </div>
      <div className="flex flex-col overflow-hidden">
        <SecondarySidebarButton
          icon={<Settings className="size-5 shrink-0" />}
          label="Settings"
          targetPath="/settings"
          onClick={() => navigate('/settings')}
        />
      </div>
    </SidebarBody>
  );
}

export default function AppSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full h-screen flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800">
      <SidebarProvider>
        <AppSidebarContent />
        <div className="flex h-full w-full flex-1 flex-col rounded-tl-3xl border border-neutral-200 dark:border-neutral-700 bg-background shadow-xl">
          {children}
        </div>
      </SidebarProvider>
    </div>
  );
}
