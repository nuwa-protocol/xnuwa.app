import { streamObject } from 'ai';
import { z } from 'zod';
import { llmProvider } from '@/features/ai-provider/services';

export const updateCodePrompt = (currentContent: string) => `
  Improve the following code snippet based on the given prompt.
  
  ${currentContent}
  `;

export async function updateCodeContent(
  currentContent: string,
  description: string,
  onDelta: (delta: string) => void,
): Promise<string> {
  let draftContent = '';

  const { fullStream } = streamObject({
    model: llmProvider.artifact(),
    system: updateCodePrompt(currentContent),
    prompt: description,
    schema: z.object({
      code: z.string(),
    }),
  });

  for await (const delta of fullStream) {
    if (delta.type === 'object' && delta.object.code) {
      draftContent = delta.object.code;
      onDelta(delta.object.code);
    }
  }

  return draftContent;
}
