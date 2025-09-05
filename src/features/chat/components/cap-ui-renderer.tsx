import { NUWA_CLIENT_TIMEOUT } from '@nuwa-ai/ui-kit';
import { AlertCircle } from 'lucide-react';
import { connect, WindowMessenger } from 'penpal';
import { useCallback, useRef, useState } from 'react';
import { TextShimmer } from '@/shared/components/ui/text-shimmer';
import {
  closeNuwaMCPClient,
  createNuwaMCPClient,
} from '@/shared/services/mcp-client';
import { useChatContext } from '../../chat/contexts/chat-context';

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
};

export const CapUIRenderer = ({
  srcUrl,
  title,
  artifact = false,
}: CapUIRendererProps) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const { chatState } = useChatContext();
  const { sendMessage } = chatState;

  const [height, setHeight] = useState<number>(100); // Default height
  const [isLoading, setIsLoading] = useState(true);

  const nuwaClientMethods = {
    sendPrompt: (prompt: string) => {
      sendMessage({ text: prompt });
    },

    addSelection: (label: string, message: string) => {
      // onAddSelection?.(label, message);
    },

    saveState: (state: any) => {
      // onSaveState?.(state);
    },

    getState: () => {
      // onGetState?.();
    },
  }

  const connectToPenpal = useCallback(async () => {
    try {
      if (!iframeRef.current?.contentWindow) {
        throw new Error('Iframe content not accessible');
      }

      const messenger = new WindowMessenger({
        remoteWindow: iframeRef.current.contentWindow,
        allowedOrigins: ['*'],
      });

      await connect({
        messenger,
        methods: {
          ...nuwaClientMethods,
          setHeight,
        },
        timeout: NUWA_CLIENT_TIMEOUT,
      }).promise;

      // onPenpalConnected?.();
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error(`Failed to connect to ${title ?? srcUrl} over Penpal`);
      // onPenpalConnectionError?.(err);
    }
  }, [title, srcUrl]);

  const connectToMCP = useCallback(async () => {
    try {
      if (!iframeRef.current?.contentWindow) {
        throw new Error('Iframe not ready');
      }

      const mcpClient = await createNuwaMCPClient(srcUrl, 'postMessage', {
        targetWindow: iframeRef.current?.contentWindow,
      });

      // onMCPConnected?.(mcpClient);
    } catch (error) {
      const err =
        error instanceof Error
          ? error
          : new Error(`Failed to connect to ${title ?? srcUrl} over MCP`);
      // onMCPConnectionError?.(err);
      await closeNuwaMCPClient(srcUrl);
    }
  }, [title, srcUrl]);

  const sandbox = 'allow-scripts';

  const allowPermissions = `accelerometer 'none'; 
         ambient-light-sensor 'none'; 
         autoplay 'none'; 
         battery 'none'; 
         camera 'none'; 
         display-capture 'none'; 
         document-domain 'none'; 
         encrypted-media 'none'; 
         fullscreen 'none'; 
         gamepad 'none'; 
         geolocation 'none'; 
         gyroscope 'none'; 
         layout-animations 'none'; 
         legacy-image-formats 'none'; 
         magnetometer 'none'; 
         microphone 'none'; 
         midi 'none'; 
         oversized-images 'none'; 
         payment 'none'; 
         picture-in-picture 'none'; 
         publickey-credentials-get 'none'; 
         speaker-selection 'none'; 
         sync-xhr 'none'; 
         unoptimized-images 'none'; 
         unsized-media 'none'; 
         usb 'none'; 
         screen-wake-lock 'none'; 
         web-share 'none'; 
         xr-spatial-tracking 'none';`;

  if (!srcUrl) {
    console.error('No URL provided for HTML resource');
    return <ErrorScreen artifact={artifact} />;
  }

  return (
    <div className="relative" style={{ height: artifact ? '100%' : height }}>
      {isLoading && <LoadingScreen artifact={artifact} />}
      <iframe
        src={srcUrl}
        allow={allowPermissions}
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
        sandbox={sandbox}
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
