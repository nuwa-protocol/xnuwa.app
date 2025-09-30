import { CapUIRenderer } from '@/shared/components/cap-ui-renderer';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import type { CapArtifact } from '@/shared/types';
import { useChatContext } from '../contexts/chat-context';
import { useArtifact } from '../hooks/use-artifact';
import { ArtifactSaveBadge } from './artifact-save-badge';

type ArtifactProps = {
  artifact: CapArtifact;
};

export const Artifact = ({ artifact }: ArtifactProps) => {
  const {
    // hasConnectionError,
    // isProcessingAIRequest,
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
  } = useArtifact();

  const { chat } = useChatContext();
  const { getCurrentCap } = CurrentCapStore();
  const cap = getCurrentCap();

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      {/* <ArtifactHeader
        hasConnectionError={hasConnectionError}
        isProcessingAIRequest={isProcessingAIRequest}
        saveStatus={saveStatus}
      /> */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <CapUIRenderer
          key={`${artifact}-${chat.id}`}
          srcUrl={artifact.srcUrl}
          title={cap?.idName || ''}
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
      </div>
      {/* Saving badge (bottom-right). Subtle, pops in/out to the right. */}
      <ArtifactSaveBadge saveStatus={saveStatus} />
    </div>
  );
};
