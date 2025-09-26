import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChatSessionsStore } from '@/features/chat/stores';
import { SearchModalTrigger } from '@/features/sidebar/components/search-modal';
import { SidebarGroup, SidebarGroupContent } from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks/use-language';
import { useSidebar } from './sidebar';
import { SidebarChatItem } from './sidebar-chat-item';
import { SidebarLabel } from './sidebar-label';

export function SidebarChats() {
  const { chatSessions } = ChatSessionsStore();
  const { t } = useLanguage();
  const { open } = useSidebar();
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);

  // get chat sessions within five days only
  const now = Date.now();
  const fiveDaysAgo = now - 5 * 24 * 60 * 60 * 1000;
  const sessionsWithinFiveDays = Object.values(chatSessions).filter(
    (session) => session.messages.length > 0,
  );
  const sessions = Object.values(chatSessions);

  // Separate pinned and recent chats
  const pinnedChats = sessions
    .filter((session) => session.pinned)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const recentChats = sessionsWithinFiveDays
    .filter((session) => !session.pinned && session.updatedAt >= fiveDaysAgo)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  // check if both groups are empty
  const isAllEmpty = pinnedChats.length === 0 && recentChats.length === 0;

  if (isAllEmpty && !open) {
    return null;
  }

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

  return (
    <div className="mt-4 flex-1 flex flex-col overflow-hidden">
      {/* Pinned Chats */}
      {pinnedChats.length > 0 && (
        <motion.div
          animate={{
            display: open ? 'block' : 'none',
            opacity: open ? 1 : 0,
            borderBottom: open ? '1px solid #e0e0e0' : 'none',
          }}
          className="mb-4 pb-2"
        >
          <SidebarLabel label={t('chatHistory.pinnedChats')} open={open} />
          <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto flex-1 hide-scrollbar">
            {pinnedChats.map((chat) => (
              <SidebarChatItem
                key={chat.id}
                chat={chat}
                hoveredChatId={hoveredChatId}
                setHoveredChatId={setHoveredChatId}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Chats */}

      <motion.div
        animate={{
          display: open ? 'block' : 'none',
          opacity: open ? 1 : 0,
        }}
      >
        <SidebarLabel
          label={t('chatHistory.recentChats')}
          open={open}
          extraElement={<SearchModalTrigger />}
        />
        <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto flex-1 hide-scrollbar">
          {recentChats.map((chat) => (
            <SidebarChatItem
              key={chat.id}
              chat={chat}
              hoveredChatId={hoveredChatId}
              setHoveredChatId={setHoveredChatId}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
