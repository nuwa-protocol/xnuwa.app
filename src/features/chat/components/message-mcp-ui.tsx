import type { UIResource } from '@nuwa-ai/ui-kit';
import { IframeUIRenderer } from '@/shared/components/iframe-ui-renderer';
import { useMCPUI } from '../hooks/use-mcp-ui';

type MessageMCPUIProps = {
  resource: UIResource;
};

// Renders an MCP UI resource returned by a dynamic tool call.
// Uses the shared Cap UI renderer (which internally wires up useIframeUIRenderer)
// to safely embed and connect to the remote UI.
export const MessageMCPUI = ({
  resource,
}: MessageMCPUIProps) => {
  const srcUrl = resource.resource?.text || '';
  const title = resource.resource?.name || 'MCP UI';

  const { handleSendPrompt, handlePenpalConnectionError } = useMCPUI();

  return <IframeUIRenderer srcUrl={srcUrl} title={title} artifact={false} onSendPrompt={handleSendPrompt} onPenpalConnectionError={handlePenpalConnectionError} />;
};

MessageMCPUI.displayName = 'MessageMCPUI';
