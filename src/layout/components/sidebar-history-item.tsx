import type { ChatSession } from '@/stores/chat-store';
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { MoreHorizontalIcon, TrashIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useFloatingSidebar } from './floating-sidebar';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  chat: ChatSession;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  const router = useRouter();
  const { t } = useLanguage();
  const floatingContext = useFloatingSidebar();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleChatSelect = () => {
    setOpenMobile(false);
    router.push(`/chat?cid=${chat.id}`);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <button type="button" onClick={handleChatSelect}>
          <span>{chat.title}</span>
        </button>
      </SidebarMenuButton>

      <DropdownMenu
        modal={true}
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          floatingContext.stayHovering(open);
        }}
      >
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
            showOnHover={!isActive}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">{t('actions.more')}</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
            onSelect={() => onDelete(chat.id)}
          >
            <TrashIcon />
            <span>{t('actions.delete')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  if (prevProps.chat.id !== nextProps.chat.id) return false;
  if (prevProps.chat.title !== nextProps.chat.title) return false;
  if (prevProps.chat.updatedAt !== nextProps.chat.updatedAt) return false;
  return true;
});
