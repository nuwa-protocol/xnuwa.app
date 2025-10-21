import { useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CapStudioStore } from '@/features/cap-studio/stores/cap-studio-stores';
import type { LocalCap } from '@/features/cap-studio/types';
import {
  isOnResponseDataMark,
  type OnResponseDataMark,
} from '@/features/chat/types/marks';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { InstalledCapsStore } from '@/shared/stores/installed-caps-store';
import type { Cap } from '@/shared/types';
import { ChatInstanceStore, ChatSessionsStore } from '../stores';
import { convertToUIMessage } from '../utils';
import { useUpdateChatTitle } from './use-update-chat-title';

export function useChatInstance(chatId: string, onStreamStart?: () => void) {
  const navigate = useNavigate();
  const { getChatSession, chatSessions, addChatSessionCap } =
    ChatSessionsStore();
  const { getInstance } = ChatInstanceStore();
  const { updateTitle } = useUpdateChatTitle();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentCap, setCurrentCap } = CurrentCapStore();
  const cap =
    currentCap && ('capData' in currentCap ? currentCap.capData : currentCap);
  // Track last seen cap key from the session to avoid overriding current cap
  const lastSessionCapKeyRef = useRef<string | null>(null);

  const getCapKey = (c: any | null | undefined): string | null => {
    if (!c) return null;
    if (typeof c === 'object') {
      return 'capData' in (c as any)
        ? `local:${(c as any).id}`
        : `remote:${(c as any).id}`;
    }
    if (typeof c === 'string') {
      return `id:${c}`;
    }
    return null;
  };

  // Resolve a Cap or LocalCap object by its capId string
  const resolveCapById = (capId: string): Cap | LocalCap | null => {
    const installed = InstalledCapsStore.getState().installedCaps.find(
      (c) => c.id === capId,
    );
    if (installed) return installed;
    const local = CapStudioStore.getState().localCaps.find(
      (lc) => lc.capData.id === capId,
    );
    if (local) return local;
    const cur = CurrentCapStore.getState().currentCap;
    if (cur) {
      const curId = 'capData' in cur ? cur.capData.id : cur.id;
      if (curId === capId) return cur as any;
    }
    return null;
  };

  // chat data handler
  const handleOnData = useCallback(
    (data: any) => {
      // process the data mark onResponse - shows when the AI has started to respond
      if (data?.type === 'data-mark' && isOnResponseDataMark(data.data)) {
        const payload = data.data as OnResponseDataMark;
        updateTitle(chatId);
        onStreamStart?.();
        addChatSessionCap(chatId, payload.cap);
      }
      // process the abnormal finish reason - content-filter
      if (data.type === 'data-finishReason') {
        const finishReason = data.data.finishReason;
        if (finishReason === 'content-filter') {
          toast.warning(
            'The AI has refused to continue due to content moderation policy of the LLM provider',
            {
              duration: 8000,
            },
          );
        }
      }
    },
    [chatId, updateTitle, onStreamStart, addChatSessionCap],
  );

  // chat finish handler
  const handleOnFinish = useCallback(() => {
    const currentUrlChatId = new URLSearchParams(window.location.search).get(
      'chat_id',
    );

    // Show completion toast for background chats
    if (currentUrlChatId !== chatId) {
      const session = getChatSession(chatId);
      toast.success(
        `Your chat ${session ? `"${session.title}"` : ''} is completed`,
        {
          action: {
            label: 'View Chat',
            onClick: () => {
              const newSearchParams = new URLSearchParams(searchParams);
              newSearchParams.set('chat_id', chatId);
              setSearchParams(newSearchParams);
            },
          },
        },
      );
    }
  }, [chatId, getChatSession, searchParams, setSearchParams]);

  // chat init config
  const useChatInitConfig = {
    initialMessages: chatSessions[chatId]
      ? chatSessions[chatId].messages.map(convertToUIMessage)
      : [],
    onFinish: handleOnFinish,
    onData: handleOnData,
  };

  // Keep CurrentCap in sync with session when the caps list actually changes.
  useEffect(() => {
    const session = chatSessions[chatId];
    if (!session) return;

    const caps = session.caps || [];
    const lastCapRaw = caps.length > 0 ? caps[caps.length - 1] : undefined;
    const lastKey = getCapKey(lastCapRaw);

    // Only react when the session's last cap actually changed
    if (lastKey === lastSessionCapKeyRef.current) return;
    lastSessionCapKeyRef.current = lastKey;

    const currKey = getCapKey(currentCap);
    if (!lastKey || currKey === lastKey) return;

    // Resolve string entry if needed, then sync current cap
    let nextCap: Cap | LocalCap | null = null;
    if (lastCapRaw && typeof lastCapRaw === 'object') {
      nextCap = lastCapRaw as Cap | LocalCap;
    } else if (typeof lastCapRaw === 'string') {
      nextCap = resolveCapById(lastCapRaw);
    }

    if (nextCap) {
      setCurrentCap(nextCap);
    }
  }, [chatSessions[chatId]?.caps, setCurrentCap, currentCap]);

  // return existing instance or create a new one from the store
  return getInstance(chatId, useChatInitConfig.initialMessages, {
    onFinish: useChatInitConfig.onFinish,
    onData: useChatInitConfig.onData,
  });
}
