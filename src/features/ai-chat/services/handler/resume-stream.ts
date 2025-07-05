import { ChatStateStore } from '@/features/ai-chat/stores/chat-store';
import { ChatSDKError } from '@/shared/errors/chatsdk-errors';

// define stream state
enum StreamState {
  INITIAL = 'initial',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ERROR = 'error',
}

interface StreamMetadata {
  state: StreamState;
  error?: Error;
  retryCount: number;
  lastActiveTime: number;
}

// create a simple client stream context interface
interface ClientStreamContext {
  resumableStream: (
    streamId: string,
    getStream: () => ReadableStream,
  ) => Promise<ReadableStream>;
}

// store stream metadata
const streamMetadata = new Map<string, StreamMetadata>();

// maximum retry attempts
const MAX_RETRY_ATTEMPTS = 3;
// retry delay (milliseconds)
const RETRY_DELAY = 1000;
// stream timeout (milliseconds)
const STREAM_TIMEOUT = 30000;

let globalStreamContext: ClientStreamContext | null = null;

// create a resumable ReadableStream
function createResumableStream(
  originalStream: ReadableStream,
  streamId: string,
): ReadableStream {
  let reader = originalStream.getReader();
  let isFirstChunk = true;

  return new ReadableStream({
    async start() {
      try {
        streamMetadata.set(streamId, {
          state: StreamState.INITIAL,
          retryCount: 0,
          lastActiveTime: Date.now(),
        });
      } catch (error) {
        console.error('Error initializing stream:', error);
      }
    },
    async pull(controller) {
      const pullData = async () => {
        try {
          const metadata = streamMetadata.get(streamId);
          if (!metadata) {
            throw new Error('Stream metadata not found');
          }

          if (isFirstChunk) {
            metadata.state = StreamState.ACTIVE;
            streamMetadata.set(streamId, metadata);
            isFirstChunk = false;
          }

          const { value, done } = await reader.read();

          if (done) {
            streamMetadata.set(streamId, {
              ...metadata,
              state: StreamState.COMPLETED,
            });
            controller.close();
            return;
          }

          // update last active time
          streamMetadata.set(streamId, {
            ...metadata,
            lastActiveTime: Date.now(),
          });

          controller.enqueue(value);
        } catch (error) {
          const metadata = streamMetadata.get(streamId);
          if (!metadata) {
            controller.error(new ChatSDKError('bad_request:stream'));
            return;
          }

          if (metadata.retryCount < MAX_RETRY_ATTEMPTS) {
            // try to retry
            metadata.retryCount++;
            metadata.state = StreamState.PAUSED;
            streamMetadata.set(streamId, metadata);

            // wait for a while and then retry
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));

            // recreate reader
            reader = originalStream.getReader();
            await pullData();
          } else {
            // exceed maximum retry attempts
            metadata.state = StreamState.ERROR;
            metadata.error = error as Error;
            streamMetadata.set(streamId, metadata);
            controller.error(new ChatSDKError('bad_request:stream'));
          }
        }
      };

      await pullData();
    },
    cancel() {
      reader.cancel();
    },
  });
}

export function getStreamContext(): ClientStreamContext | null {
  if (!globalStreamContext) {
    globalStreamContext = {
      resumableStream: async (
        streamId: string,
        getStream: () => ReadableStream,
      ) => {
        const { getStreamIdsByChatId } = ChatStateStore.getState();

        try {
          // get all stream IDs for the current session
          const existingStreamIds = await getStreamIdsByChatId(streamId);
          const metadata = streamMetadata.get(streamId);

          // check if stream needs to be resumed
          if (existingStreamIds.includes(streamId) && metadata) {
            const timeSinceLastActive = Date.now() - metadata.lastActiveTime;

            if (
              metadata.state === StreamState.PAUSED ||
              (metadata.state === StreamState.ACTIVE &&
                timeSinceLastActive > STREAM_TIMEOUT)
            ) {
              console.log(`Resuming stream: ${streamId}`);
              // reset retry count
              metadata.retryCount = 0;
              streamMetadata.set(streamId, metadata);
            }
          } else {
            console.log(`Creating new stream: ${streamId}`);
          }

          // create a new stream or resume an existing stream
          const originalStream = getStream();
          return createResumableStream(originalStream, streamId);
        } catch (error) {
          console.error(`Error in resumableStream: ${error}`);
          throw new ChatSDKError('bad_request:stream');
        }
      },
    };
  }

  return globalStreamContext;
}
