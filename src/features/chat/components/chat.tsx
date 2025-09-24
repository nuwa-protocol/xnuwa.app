import { motion } from 'framer-motion';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/shared/components/ui/resizable';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { Artifact } from './artifact';
import { ChatContent } from './chat-content';

export function Chat({ isReadonly }: { isReadonly: boolean }) {
  const { currentCap } = CurrentCapStore();
  const artifact = currentCap.core.artifact;

  if (artifact) {
    return (
      <div className="flex w-full h-full">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={40} minSize={30}>
            <ChatContent isReadonly={isReadonly} />
          </ResizablePanel>
          <ResizableHandle withHandle className="h-4 my-auto" />
          <ResizablePanel
            defaultSize={60}
            minSize={50}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
              className="h-full border-l-2"
            >
              <Artifact artifact={artifact} />
            </motion.div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }

  return <ChatContent isReadonly={isReadonly} />;
}
