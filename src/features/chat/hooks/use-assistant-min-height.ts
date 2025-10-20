import type { UIMessage } from 'ai';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const CHAT_HEADER_HEIGHT = 310;

interface UseAssistantMinHeightOptions {
  messages: UIMessage[];
  headerHeight?: number;
}

type MessageRefs = Map<string, HTMLDivElement>;

export function useAssistantMinHeight({
  messages,
}: UseAssistantMinHeightOptions) {
  const messageRefs = useRef<MessageRefs>(new Map());
  const [lastAssistantMinHeight, setLastAssistantMinHeight] = useState<
    string | undefined
  >(undefined);

  const lastAssistantIndex = useMemo(
    () => messages.findLastIndex((message) => message.role === 'assistant'),
    [messages],
  );

  const lastAssistantMessage =
    lastAssistantIndex !== -1 ? messages[lastAssistantIndex] : undefined;
  const lastAssistantId = lastAssistantMessage?.id;
  const isLastAssistantLatest =
    lastAssistantIndex !== -1 && lastAssistantIndex === messages.length - 1;

  const previousUserMessage = useMemo(() => {
    if (lastAssistantIndex <= 0) return undefined;

    for (let i = lastAssistantIndex - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === 'user') {
        return messages[i];
      }
    }

    return undefined;
  }, [lastAssistantIndex, messages]);
  const previousUserId = previousUserMessage?.id;

  const recalcAssistantMinHeight = useCallback(() => {
    if (
      typeof window === 'undefined' ||
      !lastAssistantId ||
      !isLastAssistantLatest
    ) {
      setLastAssistantMinHeight(undefined);
      return;
    }

    let availableHeight = window.innerHeight - CHAT_HEADER_HEIGHT;

    if (previousUserId) {
      const prevUserNode = messageRefs.current.get(previousUserId);

      if (prevUserNode) {
        const rect = prevUserNode.getBoundingClientRect();
        const styles = window.getComputedStyle(prevUserNode);
        const marginTop = Number.parseFloat(styles.marginTop || '0') || 0;
        const marginBottom = Number.parseFloat(styles.marginBottom || '0') || 0;

        availableHeight -= rect.height + marginTop + marginBottom;
      }
    }

    const minHeight = Math.max(0, availableHeight);
    setLastAssistantMinHeight(
      minHeight > 0 ? `${Math.ceil(minHeight)}px` : undefined,
    );
  }, [
    CHAT_HEADER_HEIGHT,
    isLastAssistantLatest,
    lastAssistantId,
    previousUserId,
  ]);

  useLayoutEffect(() => {
    recalcAssistantMinHeight();
  }, [messages, recalcAssistantMinHeight]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      recalcAssistantMinHeight();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [recalcAssistantMinHeight]);

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !previousUserId ||
      typeof ResizeObserver === 'undefined'
    ) {
      return;
    }

    const node = messageRefs.current.get(previousUserId);
    if (!node) return;

    const observer = new ResizeObserver(() => {
      recalcAssistantMinHeight();
    });

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [previousUserId, recalcAssistantMinHeight]);

  const registerMessageNode = useCallback(
    (messageId: string) => (node: HTMLDivElement | null) => {
      if (node) {
        messageRefs.current.set(messageId, node);
      } else {
        messageRefs.current.delete(messageId);
      }

      if (
        typeof window !== 'undefined' &&
        (messageId === previousUserId || messageId === lastAssistantId)
      ) {
        if (typeof window.requestAnimationFrame === 'function') {
          window.requestAnimationFrame(() => {
            recalcAssistantMinHeight();
          });
        } else {
          setTimeout(() => {
            recalcAssistantMinHeight();
          }, 0);
        }
      }
    },
    [lastAssistantId, previousUserId, recalcAssistantMinHeight],
  );

  return {
    lastAssistantId,
    lastAssistantMinHeight,
    registerMessageNode,
  };
}
