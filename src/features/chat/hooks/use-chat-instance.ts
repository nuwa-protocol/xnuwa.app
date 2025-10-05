import { useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { ChatErrorCode, handleError } from '@/shared/utils/handl-error';
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

  // chat error handler
  const handleChatError = useCallback(
    (error: Error) => {
      const errorCode = handleError(error);
      switch (errorCode) {
        case ChatErrorCode.IGNORED_ERROR:
          return;
        case ChatErrorCode.INSUFFICIENT_FUNDS:
          toast.warning('Insufficient funds', {
            description: 'Please top up your balance to continue',
            duration: 8000,
            action: {
              label: 'Go to Wallet',
              onClick: () => navigate('/wallet'),
            },
          });
          break;
        default:
          toast.error('An error occurred', {
            description: 'Please check your network connection and try again',
            action: {
              label: 'Retry',
              onClick: () =>
                console.warn(
                  'Retry action needs to be handled by the component',
                ),
            },
          });
      }
    },
    [navigate],
  );

  // chat data handler
  const handleOnData = useCallback(
    (data: any) => {
      // process the data mark onResponse - shows when the AI has started to respond
      if (data.type === 'data-mark' && data.data === 'onResponse') {
        updateTitle(chatId);
        onStreamStart?.();
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
    [chatId, updateTitle, onStreamStart, currentCap],
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
    onError: handleChatError,
    onFinish: handleOnFinish,
    onData: handleOnData,
  };

  // if current session has caps, set the most recently used one as current
  useEffect(() => {
    const session = chatSessions[chatId];
    if (!session) return;

    // Prefer the last cap in the caps array (most recently used)
    const caps = session.caps;
    const lastCap = caps && caps.length > 0 ? caps[caps.length - 1] : undefined;

    if (lastCap && lastCap !== cap) {
      setCurrentCap(lastCap);
    }
  }, [chatSessions[chatId], setCurrentCap]);

  // return existing instance or create a new one from the store
  return getInstance(chatId, useChatInitConfig.initialMessages, {
    onError: useChatInitConfig.onError,
    onFinish: useChatInitConfig.onFinish,
    onData: useChatInitConfig.onData,
  });
}
