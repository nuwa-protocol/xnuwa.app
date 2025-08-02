import { SearchIcon } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useChatSessions } from '@/features/chat/hooks/use-chat-sessions';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks/use-language';
import { SearchModal } from './search-modal';
import { ChatItem } from './sidebar-history-item';

export function SidebarHistory() {
  const { setOpenMobile } = useSidebar();
  const { sessionsMap, deleteSession, updateSession } = useChatSessions();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [searchParams] = useSearchParams();
  const chatSessionId = searchParams.get('cid');

  // get all sessions with messages
  const now = Date.now();
  const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;

  const allSessionsWithMessages = Object.values(sessionsMap).filter(
    (session) => session.messages.length > 0,
  );

  // Separate pinned and recent chats
  const pinnedChats = allSessionsWithMessages
    .filter((session) => session.pinned)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const recentChats = allSessionsWithMessages
    .filter((session) => !session.pinned && session.updatedAt >= fiveDaysAgo)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  // check if both groups are empty
  const isAllEmpty = pinnedChats.length === 0 && recentChats.length === 0;

  if (isAllEmpty) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t('chatHistory.noChats')}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('chatHistory.startConversation')}
              </p>
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  const handleDelete = (id: string) => {
    deleteSession(id);
    if (id === chatSessionId) {
      navigate('/chat');
    }
  };

  const handleRename = (id: string, newTitle: string) => {
    updateSession(id, { title: newTitle });
  };

  const handleTogglePin = (id: string) => {
    const session = sessionsMap[id];
    if (session) {
      updateSession(id, { pinned: !session.pinned });
    }
  };

  // render pinned chats group
  const renderPinnedChats = () => {
    if (pinnedChats.length === 0) return null;
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{t('chatHistory.pinnedChats')}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {pinnedChats.map((session) => (
              <ChatItem
                key={session.id}
                chat={session}
                isActive={session.id === chatSessionId}
                onDelete={handleDelete}
                onRename={handleRename}
                onTogglePin={handleTogglePin}
                setOpenMobile={setOpenMobile}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  // render recent chats group
  const renderRecentChats = () => {
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center justify-between">
          <span>{t('chatHistory.recentChats')}</span>
          <SearchModal>
            <button
              type="button"
              className="p-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-sm transition-colors"
              aria-label={t('nav.sidebar.search')}
            >
              <SearchIcon className="h-3 w-3" />
            </button>
          </SearchModal>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {recentChats.map((session) => (
              <ChatItem
                key={session.id}
                chat={session}
                isActive={session.id === chatSessionId}
                onDelete={handleDelete}
                onRename={handleRename}
                onTogglePin={handleTogglePin}
                setOpenMobile={setOpenMobile}
              />
            ))}
            <SidebarMenuItem>
              <SearchModal>
                <SidebarMenuButton className="text-sidebar-foreground/70 hover:text-sidebar-foreground">
                  <SearchIcon className="h-4 w-4" />
                  <span>{t('chatHistory.moreChats')}</span>
                </SidebarMenuButton>
              </SearchModal>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <>
      {renderPinnedChats()}
      {renderRecentChats()}
    </>
  );
}
