import {
  EditIcon,
  MoreHorizontalIcon,
  PinIcon,
  PinOffIcon,
  TrashIcon,
} from 'lucide-react';
import { memo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { ChatSession } from '@/features/chat/types';
import { RenameDialog } from '@/shared/components/rename-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks/use-language';
import { useAppSidebar } from './app-sidebar';

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  onRename,
  onTogglePin,
  setOpenMobile,
}: {
  chat: ChatSession;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  onRename: (chatId: string, newTitle: string) => void;
  onTogglePin: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  const floatingContext = useAppSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  const handleChatSelect = () => {
    setOpenMobile(false);
    if (location.pathname !== '/chat') {
      navigate(`/chat?chat_id=${chat.id}`);
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('chat_id', chat.id);
      setSearchParams(newParams);
    }
  };

  const handleRename = () => {
    setRenameDialogOpen(true);
    setMenuOpen(false);
  };

  const handleRenameConfirm = (newTitle: string) => {
    onRename(chat.id, newTitle);
  };

  const handleTogglePin = () => {
    onTogglePin(chat.id);
    setMenuOpen(false);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={isActive} onClick={handleChatSelect}>
        <span>{chat.title}</span>
      </SidebarMenuButton>

      <DropdownMenu
        modal={true}
        open={menuOpen}
        onOpenChange={(open) => {
          setMenuOpen(open);
          floatingContext.stayHovering(open);
          if (!open) {
            floatingContext.closeSidebar();
            // Remove focus from the trigger button to eliminate the ring
            setTimeout(() => {
              (document.activeElement as HTMLElement)?.blur();
            }, 0);
          }
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
          <DropdownMenuItem className="cursor-pointer" onSelect={handleRename}>
            <EditIcon />
            <span>{t('actions.rename')}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={handleTogglePin}
          >
            {chat.pinned ? <PinOffIcon /> : <PinIcon />}
            <span>{chat.pinned ? t('actions.unpin') : t('actions.pin')}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
            onSelect={() => onDelete(chat.id)}
          >
            <TrashIcon />
            <span>{t('actions.delete')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={(open) => {
          setRenameDialogOpen(open);
          floatingContext.stayHovering(open);
          if (!open) {
            floatingContext.closeSidebar();
            // Remove focus from the trigger button to eliminate the ring
            setTimeout(() => {
              (document.activeElement as HTMLElement)?.blur();
            }, 0);
          }
        }}
        currentName={chat.title}
        onRename={handleRenameConfirm}
      />
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
