import type { ComponentProps } from 'react';

import { type SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Button } from './ui/button';
import { useSidebarSettings } from '@/hooks/use-settings-sidebar';
import { Pin, PinOff } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { setOpen } = useSidebar();
  const { mode: sidebarMode, setSidebarMode } = useSidebarSettings();
  const { t } = useLanguage();

  const handleToggleMode = () => {
    const newMode = sidebarMode === 'pinned' ? 'floating' : 'pinned';
    setSidebarMode(newMode);

    // In pinned mode, open the sidebar by default
    // In floating mode, let hover logic control it
    if (newMode === 'pinned') {
      setOpen(true);
    }
  };

  const isPinned = sidebarMode === 'pinned';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          data-testid="sidebar-toggle-button"
          onClick={handleToggleMode}
          variant="ghost"
          className="md:px-2 md:h-fit transition-all duration-200 ease-in-out hover:scale-105 border-none bg-transparent shadow-none"
        >
          <div className="transition-transform duration-200 ease-in-out">
            {isPinned ? <Pin size={16} /> : <PinOff size={16} />}
          </div>
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start">
        {isPinned ? t('nav.sidebar.toggleUnpin') : t('nav.sidebar.togglePin')}
      </TooltipContent>
    </Tooltip>
  );
}
