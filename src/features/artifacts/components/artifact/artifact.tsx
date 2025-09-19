import { CapUIRenderer } from '@/shared/components/cap-ui-renderer';
import { useArtifact } from '../../hooks/use-artifact';
import { ArtifactHeader } from './artifact-header';

type ArtifactProps = {
  artifactId: string;
};

export const Artifact = ({ artifactId }: ArtifactProps) => {
  const {
    artifactSession,
    hasConnectionError,
    isProcessingAIRequest,
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
  } = useArtifact(artifactId);

  if (!artifactSession) {
    return <div>Artifact not found</div>;
  }
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Header */}
      <ArtifactHeader
        title={artifactSession.title}
        hasConnectionError={hasConnectionError}
        isProcessingAIRequest={isProcessingAIRequest}
        saveStatus={saveStatus}
      />
      <div className="min-h-0 flex-1 overflow-hidden">
        <CapUIRenderer
          key={artifactId}
          srcUrl={artifactSession.artifact.core.source}
          title={artifactSession.title}
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
    </div>
  );
};
