import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { ChatErrorCode, handleError } from '@/shared/utils/handl-error';
import { ChatInstanceStore, ChatSessionsStore } from '../stores';
import { convertToUIMessage } from '../utils';
import { useUpdateChatTitle } from './use-update-chat-title';

export function useChatInstance(chatId: string) {
  const navigate = useNavigate();
  const { getChatSession, chatSessions, updateSession } = ChatSessionsStore();
  const { getInstance } = ChatInstanceStore();
  const { updateTitle } = useUpdateChatTitle();
  const { currentCap } = CurrentCapStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Add current cap to chat session
  const addCurrentCapsToChat = useCallback(
    async (id: string) => {
      const session = getChatSession(id);
      if (!session || !currentCap) return;
      if (session.caps.some((c) => c.id === currentCap.id)) return;

      await updateSession(id, {
        caps: [...session.caps, currentCap],
      });
    },
    [getChatSession, currentCap, updateSession],
  );

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
      if (data.type === 'data-mark' && data.data === 'onResponse') {
        updateTitle(chatId);
        addCurrentCapsToChat(chatId);
      }
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
    [chatId, updateTitle, addCurrentCapsToChat],
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

  // return existing instance or create a new one from the store
  return getInstance(chatId, useChatInitConfig.initialMessages, {
    onError: useChatInitConfig.onError,
    onFinish: useChatInitConfig.onFinish,
    onData: useChatInitConfig.onData,
  });
}
