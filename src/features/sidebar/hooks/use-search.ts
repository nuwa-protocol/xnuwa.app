import { useMemo, useState } from 'react';
import { useChatSessions } from '@/features/chat/hooks/use-chat-sessions';

export const useSearch = () => {
  const { sessionsMap } = useChatSessions();
  const [query, setQuery] = useState('');

  const sessionList = useMemo(
    () => Object.values(sessionsMap).sort((a, b) => b.updatedAt - a.updatedAt),
    [sessionsMap],
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
