import { MoreHorizontalIcon } from 'lucide-react';
import { memo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChatDropdownMenu } from '@/features/chat/components/chat-dropdown-menu';
import type { ChatSession } from '@/features/chat/types';
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/components/ui';
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
  const floatingContext = useAppSidebar();

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

  const handleRename = (newTitle: string) => {
    onRename(chat.id, newTitle);
  };

  const handleTogglePin = () => {
    onTogglePin(chat.id);
  };

  const handleDelete = () => {
    onDelete(chat.id);
  };

  const handleMenuOpenChange = (open: boolean) => {
    floatingContext.stayHovering(open);
    if (!open) {
      floatingContext.closeSidebar();
      setTimeout(() => {
        (document.activeElement as HTMLElement)?.blur();
      }, 0);
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={isActive} onClick={handleChatSelect}>
        <span>{chat.title}</span>
      </SidebarMenuButton>
      <ChatDropdownMenu
        session={chat}
        onRename={handleRename}
        onTogglePin={handleTogglePin}
        onDelete={handleDelete}
        onMenuOpenChange={handleMenuOpenChange}
        trigger={
          <SidebarMenuAction
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
            showOnHover={!isActive}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        }
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
