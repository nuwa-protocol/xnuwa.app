import { useEffect, useMemo, useState } from 'react';
import type { LocalCap } from '@/features/cap-studio/types';
import { CapAvatar } from '@/shared/components/cap-avatar';
import { CapUIRenderer } from '@/shared/components/cap-ui-renderer';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import type { Cap, CapArtifact } from '@/shared/types';
import { useChatContext } from '../contexts/chat-context';
import { useArtifact } from '../hooks/use-artifact';
import { ArtifactSaveBadge } from './artifact-save-badge';



// Render a single artifact iframe with handlers scoped to its cap.
const ArtifactFrame = ({ instance }: { instance: ArtifactInstance }) => {
  const { chat } = useChatContext();

  // Determine if this artifact belongs to the currently selected cap; only that one should register tools
  const { currentCap } = CurrentCapStore();
  const isSameCap = useMemo(() => {
    if (!currentCap) return false;
    const aLocal = 'capData' in currentCap;
    const bLocal = 'capData' in instance.cap;
    if (aLocal !== bLocal) return false;
    return currentCap.id === (instance.cap as any).id;
  }, [currentCap, instance.cap]);

  const {
    saveStatus,
    handleSendPrompt,
    handleAddSelection,
    handleSaveState,
    handleGetState,
    handleMCPConnected,
    handleMCPConnectionError,
    handlePenpalConnectionError,
    handleStreamRequest,
    handleAbortStream,
    lastToolsRef,
  } = useArtifact({ cap: instance.cap, registerTools: isSameCap });

  // When this frame's cap becomes the current cap, re-register its cached tools (if any)
  const { setCurrentCapArtifactTools } = CurrentCapStore();
  useEffect(() => {
    if (isSameCap && lastToolsRef.current) {
      setCurrentCapArtifactTools(lastToolsRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSameCap]);

  const capKey = useMemo(() => {
    const c = instance.cap as any;
    return 'capData' in c ? `local:${c.id}` : `remote:${c.id}`;
  }, [instance.cap]);

  const title = useMemo(() => {
    const cap =
      'capData' in instance.cap ? instance.cap.capData : (instance.cap as Cap);
    return cap.metadata?.displayName || cap.idName || '';
  }, [instance.cap]);

  return (
    <div className="min-h-0 h-full w-full overflow-hidden">
      <CapUIRenderer
        key={`${instance.artifact.srcUrl}-${chat.id}-${capKey}`}
        srcUrl={instance.artifact.srcUrl}
        title={title}
        artifact={true}
        onSendPrompt={handleSendPrompt}
        onAddSelection={handleAddSelection}
        onSaveState={handleSaveState}
        onGetState={handleGetState}
        onMCPConnected={handleMCPConnected}
        onMCPConnectionError={handleMCPConnectionError}
        onPenpalConnectionError={handlePenpalConnectionError}
        onStreamRequest={handleStreamRequest}
        onAbortStream={handleAbortStream}
      />
      <ArtifactSaveBadge saveStatus={saveStatus} />
    </div>
  );
};

type ArtifactInstance = {
  cap: Cap | LocalCap;
  artifact: CapArtifact;
};

type ArtifactsProps = {
  artifacts: ArtifactInstance[];
};

// Multiple-artifact panel with a simple tab-like header.
export const Artifacts = ({ artifacts }: ArtifactsProps) => {
  const tabs = artifacts.map((inst) => {
    const c: any = inst.cap;
    return ('capData' in c ? 'local:' : 'remote:') + c.id;
  });
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  if (!artifacts || artifacts.length === 0) return null;

  if (artifacts.length === 1) {
    return <ArtifactFrame instance={artifacts[0]} />;
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="flex h-full flex-col"
    >
      <TabsList className="before:bg-border relative h-auto w-full gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px overflow-x-auto hide-scrollbar whitespace-nowrap !justify-start">
        {artifacts.map((inst, idx) => {
          const cap =
            'capData' in inst.cap ? inst.cap.capData : (inst.cap as Cap);
          const label = cap.metadata?.displayName || cap.idName;
          const value = tabs[idx];
          return (
            <TabsTrigger
              key={value}
              value={value}
              title={label}
              className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none w-40 text-xs truncate flex items-center gap-2 shrink-0"
            >
              <CapAvatar cap={inst.cap as any} size="sm" />
              <span className="truncate">{label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      <div className="relative min-h-0 flex-1">
        {artifacts.map((inst, idx) => {
          const value = tabs[idx];
          return (
            <TabsContent
              key={value}
              value={value}
              forceMount
              className="mt-0 h-full p-0 data-[state=inactive]:hidden"
            >
              <ArtifactFrame instance={inst} />
            </TabsContent>
          );
        })}
      </div>
    </Tabs>
  );
};
