import type { UIMessage } from 'ai';

export function convertToUIMessage(message: UIMessage): UIMessage {
  // In AI SDK v5, UIMessage structure has changed
  // All content is now stored in the parts array
  return {
    id: message.id,
    role: message.role,
    parts: message.parts || [],
  };
}
