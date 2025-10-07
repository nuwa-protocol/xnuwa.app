import { useChat } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { LocalCap } from '@/features/cap-studio/types';
import { ChatSessionsStore } from '@/features/chat/stores/chat-sessions-store';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/shared/components/ui/resizable';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import type { Cap, CapArtifact } from '@/shared/types';
import { useChatContext } from '../contexts/chat-context';
import { Artifacts } from './artifact';
import { ChatContent } from './chat-content';

export function Chat({ isReadonly }: { isReadonly: boolean }) {
  const { currentCap } = CurrentCapStore();
  const { chat } = useChatContext();
  const [showArtifact, setShowArtifact] = useState(false);
  const { messages } = useChat({ chat, experimental_throttle: 120 });
  const { chatSessions } = ChatSessionsStore();

  useEffect(() => {
    // Show artifact panel whenever any dynamic tool call appears in the chat.
    // This avoids relying on which artifact registered tools most recently.
    const hasAnyDynamicTool = messages.some((m) =>
      m.parts?.some((p: any) => p.type === 'dynamic-tool'),
    );
    if (hasAnyDynamicTool) setShowArtifact(true);
  }, [messages]);

  // Collect all artifacts from current cap and caps used in this chat session
  const artifactInstances = (() => {
    const session = chatSessions[chat.id];
    const caps: (Cap | LocalCap)[] = [];
    if (session?.caps?.length) caps.push(...session.caps);
    // Ensure currentCap is included for a brand-new session
    if (currentCap) {
      const exists = caps.some(
        (c: any) =>
          c.id === currentCap.id && 'capData' in c === 'capData' in currentCap,
      );
      if (!exists) caps.push(currentCap);
    }
    // De-dup preserving order (most recent last in store already)
    const seen = new Set<string>();
    const uniq = caps.filter((c: any) => {
      const key = ('capData' in c ? 'local:' : 'remote:') + c.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Map to instances with artifacts
    const list = uniq
      .map((c: any) => {
        const base: Cap = 'capData' in c ? c.capData : (c as Cap);
        const art: CapArtifact | undefined = base.core?.artifact;
        if (!art) return null;
        return { cap: c as Cap | LocalCap, artifact: art };
      })
      .filter(Boolean) as { cap: Cap | LocalCap; artifact: CapArtifact }[];
    return list;
  })();

  if (artifactInstances.length > 0) {
    return (
      <div className="flex w-full h-full">
        <ResizablePanelGroup direction="horizontal">
          {/* Always render chat content; it should expand to full width when the artifact side is visually hidden */}
          <ResizablePanel
            defaultSize={40}
            minSize={30}
            className="w-full h-full"
          >
            <ChatContent
              isReadonly={isReadonly}
              showArtifact={showArtifact}
              setShowArtifact={setShowArtifact}
            />
          </ResizablePanel>
          <ResizableHandle
            withHandle
            className={`h-4 my-auto ${!showArtifact ? 'hidden' : ''}`}
          />
          <ResizablePanel
            defaultSize={60}
            minSize={50}
            style={{
              ...(showArtifact ? {} : { flexGrow: 0 }),
            }}
            className={`overflow-hidden ${!showArtifact ? 'pointer-events-none' : ''}`}
          >
            <div className="h-full">
              <motion.div
                initial={false}
                animate={{
                  x: showArtifact ? 0 : '100%',
                  opacity: showArtifact ? 1 : 0,
                }}
                transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
                className={`h-full transform-gpu ${showArtifact ? 'border-l-2' : ''}`}
                style={{ willChange: 'transform, opacity' }}
              >
                <Artifacts artifacts={artifactInstances} />
              </motion.div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }

  return (
    <ChatContent
      isReadonly={isReadonly}
      showArtifact={showArtifact}
      setShowArtifact={setShowArtifact}
    />
  );
}
