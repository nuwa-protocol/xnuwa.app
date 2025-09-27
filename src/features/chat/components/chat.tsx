import { useChat } from '@ai-sdk/react';
import { motion } from 'framer-motion';
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
  const { currentCap } = CurrentCapStore();
  const artifact = currentCap.core.artifact;
  const { chat } = useChatContext();
  const { messages } = useChat({ chat });
  const { currentCapArtifactTools } = CurrentCapStore();
  const artifactToolNames = Object.keys(currentCapArtifactTools ?? {});
  const messageHasArtifactTool = messages.some((message) => {
    return message.parts?.some(
      (part) =>
        part.type === 'dynamic-tool' &&
        artifactToolNames.includes(part.toolName),
    );
  });


  if (artifact) {
    return (
      <div className="flex w-full h-full">
        <ResizablePanelGroup direction="horizontal">
          {/* Always render chat content; it should expand to full width when the artifact side is visually hidden */}
          <ResizablePanel
            defaultSize={40}
            minSize={30}
            style={{ transition: 'flex-grow 200ms ease-out' }}
          >
            <motion.div
              layout
              transition={{ layout: { type: 'tween', ease: 'easeOut', duration: 0.2 } }}
              className="h-full"
            >
              <ChatContent isReadonly={isReadonly} />
            </motion.div>
          </ResizablePanel>
          {/* Hide the resize handle when the artifact panel is collapsed; keep mounted */}
          <ResizableHandle
            withHandle
            className={`h-4 my-auto ${!messageHasArtifactTool ? 'hidden' : ''}`}
          />
          <ResizablePanel
            defaultSize={60}
            minSize={50}
            /*
             * Collapse the artifact panel without unmounting so we can animate with framer-motion.
             * We override flexGrow via inline style (higher priority than the library's) to 0 when hidden,
             * which makes the panel take no space while staying in the DOM.
             */
            style={{
              transition: 'flex-grow 200ms ease-out',
              ...(messageHasArtifactTool ? {} : { flexGrow: 0 }),
            }}
            className={`overflow-hidden ${!messageHasArtifactTool ? 'pointer-events-none' : ''}`}
          >
            <motion.div
              layout
              transition={{ layout: { type: 'tween', ease: 'easeOut', duration: 0.2 } }}
              className="h-full"
            >
              <motion.div
                /* Animate slide in/out when state changes; keep mounted */
                initial={false}
                animate={{
                  x: messageHasArtifactTool ? 0 : '100%',
                  opacity: messageHasArtifactTool ? 1 : 0,
                }}
                transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
                className={`h-full ${messageHasArtifactTool ? 'border-l-2' : ''}`}
              >
                <Artifact artifact={artifact} />
              </motion.div>
            </motion.div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }

  return <ChatContent isReadonly={isReadonly} />;
}
