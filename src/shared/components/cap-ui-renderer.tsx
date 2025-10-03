import type { StreamAIRequest } from '@nuwa-ai/ui-kit';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { TextShimmer } from '@/shared/components/ui/text-shimmer';
import {
  type ChildMethods,
  useCapUIRender,
} from '@/shared/hooks/use-cap-ui-render';
import { IFRAME_ALLOW_PERMISSIONS, IFRAME_SANDBOX } from '../config/iframe';

const ErrorScreen = ({ artifact }: { artifact?: boolean }) => {
  if (artifact) {
    return (
      <div className="flex w-full h-full">
        <div className="flex flex-col justify-center items-center gap-4 w-full">
          <div className="relative">
            <div className="absolute -inset-2 bg-destructive/10 rounded-full blur-sm"></div>
            <AlertCircle className="relative size-16 text-destructive/80" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium text-foreground">
              Failed to load Artifact
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              The artifact interface could not be loaded. Please try refreshing
              or check your connection.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex my-4">
      <span className="text-muted-foreground text-sm flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Failed to load UI
      </span>
    </div>
  );
};

const LoadingScreen = ({ artifact }: { artifact?: boolean }) => {
  if (artifact) {
    return (
      <div className="flex w-full h-full">
        <div className="flex flex-col justify-center items-center gap-6 w-full">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative">
              <div className="size-12 border-4 border-primary/20 rounded-full animate-spin">
                <div className="size-3 bg-primary rounded-full absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1"></div>
              </div>
            </div>
          </div>
          <div className="text-center space-y-3">
            <TextShimmer duration={1.5} className="text-xl font-medium">
              Loading Artifact...
            </TextShimmer>
            <p className="text-sm text-muted-foreground max-w-sm">
              Setting up the interactive interface for your artifact
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <div className="size-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="size-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="size-2 bg-primary/60 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex my-4">
      <TextShimmer duration={1} className="font-mono text-sm">
        Loading UI...
      </TextShimmer>
    </div>
  );
};

export type CapUIRendererProps = {
  srcUrl: string;
  title?: string;
  artifact?: boolean;
  onSendPrompt?: (prompt: string) => void;
  onAddSelection?: (label: string, message: string) => void;
  onSaveState?: (state: any) => void;
  onGetState?: () => any;
  onStreamRequest?: (
    request: StreamAIRequest,
    streamId: string,
    child: ChildMethods,
  ) => void;
  onAbortStream?: (streamId: string) => void;
  onPenpalConnected?: () => void;
  onMCPConnected?: (tools: Record<string, any>) => void;
  onPenpalConnectionError?: (error: Error) => void;
  onMCPConnectionError?: (error: Error) => void;
};

export const CapUIRenderer = (props: CapUIRendererProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const {
    iframeRef,
    connectToPenpal,
    connectToMCP,
    height,
    validationResult,
    isValidating,
  } = useCapUIRender(props);
  const { srcUrl, title, artifact = false } = props;

  if (!srcUrl) {
    console.error('No URL provided for HTML resource');
    return <ErrorScreen artifact={artifact} />;
  }

  // Show loading screen while validating
  if (isValidating || !validationResult) {
    return <LoadingScreen artifact={artifact} />;
  }

  // Show error screen if URL validation failed
  if (!validationResult.isValid) {
    return <ErrorScreen artifact={artifact} />;
  }

  return (
    <div className="relative" style={{ height: artifact ? '100%' : height }}>
      {isLoading && <LoadingScreen artifact={artifact} />}
      <iframe
        src={srcUrl}
        allow={IFRAME_ALLOW_PERMISSIONS}
        style={
          isLoading
            ? {
              width: 0,
              height: 0,
              position: 'absolute',
              border: 0,
            }
            : {
              width: '100%',
              height: artifact ? '100%' : height,
            }
        }
        sandbox={IFRAME_SANDBOX}
        title={title ?? 'Nuwa Cap UI'}
        ref={iframeRef}
        onLoad={() => {
          setIsLoading(false);
          connectToPenpal();
          connectToMCP();
        }}
        onErrorCapture={(error) => {
          console.error('UI Renderer Error', error);
        }}
      />
    </div>
  );
};

CapUIRenderer.displayName = 'CapUIRenderer';
