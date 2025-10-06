import { useChat } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/shared/components/ui/resizable';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { useChatContext } from '../contexts/chat-context';
import { Artifact } from './artifact';
import { ChatContent } from './chat-content';

export function Chat({ isReadonly }: { isReadonly: boolean }) {
  const { getCurrentCap } = CurrentCapStore();
  const currentCap = getCurrentCap();

  const artifact = currentCap?.core.artifact;
  const { chat } = useChatContext();
  const [showArtifact, setShowArtifact] = useState(false);
  const { messages } = useChat({ chat, experimental_throttle: 120 });
  const { currentCapArtifactTools } = CurrentCapStore();

  useEffect(() => {
    const artifactToolNames = Object.keys(currentCapArtifactTools ?? {});
    const messageHasArtifactTool = messages.some((message) => {
      return message.parts?.some(
        (part) =>
          part.type === 'dynamic-tool' &&
          artifactToolNames.includes(part.toolName),
      );
    });
    if (messageHasArtifactTool) {
      setShowArtifact(true);
    }
  }, [messages, currentCapArtifactTools]);

  if (artifact) {
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
                <Artifact artifact={artifact} />
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
