"use client";

import { useNavigate, useSearchParams } from "react-router-dom";
import { useChatSessions } from "@/features/ai-chat/hooks/use-chat-sessions";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from "@/shared/components/ui";
import { useLanguage } from "@/shared/hooks/use-language";
import { ChatItem } from "./sidebar-history-item";

export function SidebarHistory() {
  const { setOpenMobile } = useSidebar();
  const { sessionsMap, deleteSession } = useChatSessions();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [searchParams] = useSearchParams();
  const chatSessionId = searchParams.get("cid");

  // get all sessions with messages and sort by time
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayStart = startOfToday.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * oneDay;
  const thirtyDaysAgo = now - 30 * oneDay;

  const allSessionsWithMessages = Object.values(sessionsMap)
    .filter((session) => session.messages.length > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  // group by time
  const grouped = {
    today: [] as typeof allSessionsWithMessages,
    last7: [] as typeof allSessionsWithMessages,
    last30: [] as typeof allSessionsWithMessages,
    older: [] as typeof allSessionsWithMessages,
  };

  allSessionsWithMessages.forEach((session) => {
    if (session.updatedAt >= todayStart) {
      grouped.today.push(session);
    } else if (session.updatedAt >= sevenDaysAgo) {
      grouped.last7.push(session);
    } else if (session.updatedAt >= thirtyDaysAgo) {
      grouped.last30.push(session);
    } else {
      grouped.older.push(session);
    }
  });

  // check if all groups are empty
  const isAllEmpty =
    grouped.today.length === 0 &&
    grouped.last7.length === 0 &&
    grouped.last30.length === 0 &&
    grouped.older.length === 0;

  if (isAllEmpty) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {t("chatHistory.noChats")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("chatHistory.startConversation")}
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
      navigate("/chat");
    }
  };

  // group render function
  const renderGroup = (
    title: string,
    items: typeof allSessionsWithMessages
  ) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-2">
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
          {title}
        </div>
        {items.map((session) => (
          <ChatItem
            key={session.id}
            chat={session}
            isActive={session.id === chatSessionId}
            onDelete={handleDelete}
            setOpenMobile={setOpenMobile}
          />
        ))}
      </div>
    );
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {renderGroup(t("chatHistory.today"), grouped.today)}
          {renderGroup(t("chatHistory.thisWeek"), grouped.last7)}
          {renderGroup(t("chatHistory.aWeekAgo"), grouped.last30)}
          {renderGroup(t("chatHistory.older"), grouped.older)}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
