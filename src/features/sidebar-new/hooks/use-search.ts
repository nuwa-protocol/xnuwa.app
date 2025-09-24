import { useMemo, useState } from 'react';
import { ChatSessionsStore } from '@/features/chat/stores';

export const useSearch = () => {
  const { chatSessions } = ChatSessionsStore();
  const [query, setQuery] = useState('');

  const sessionList = useMemo(
    () => Object.values(chatSessions).sort((a, b) => b.updatedAt - a.updatedAt),
    [chatSessions],
  );
  const filtered = useMemo(() => {
    if (!query.trim()) return sessionList;
    return sessionList.filter((s) =>
      s.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, sessionList]);
  return {
    query,
    setQuery,
    sessionList,
    filtered,
  };
};
