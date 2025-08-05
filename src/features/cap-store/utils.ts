import { type Cap, CapSchema } from '@/shared/types/cap';

// Cap type guards and utility functions
export function validateCapContent(content: unknown): content is Cap {
  try {
    CapSchema.parse(content);
    return true;
  } catch {
    return false;
  }
}

export function parseCapContent(content: unknown): Cap {
  return CapSchema.parse(content);
}
