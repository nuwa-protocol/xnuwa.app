import { useEffect, useMemo } from 'react';
import type { LocalCap } from '@/features/cap-studio/types';
import { IframeUIRenderer } from '@/shared/components/iframe-ui-renderer';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import type { Cap, CapArtifact } from '@/shared/types';
import { useChatContext } from '../contexts/chat-context';
import { useArtifact } from '../hooks/use-artifact';
import { ArtifactSaveBadge } from './artifact-save-badge';

export type ArtifactInstance = {
  cap: Cap | LocalCap;
  artifact: CapArtifact;
};

// Render a single artifact iframe with handlers scoped to its cap.
export const Artifact = ({ instance }: { instance: ArtifactInstance }) => {
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
      <IframeUIRenderer
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
