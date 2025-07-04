import { streamObject } from 'ai';
import { z } from 'zod';
import { llmProvider } from '@/features/ai-provider/services';

export const updateDocumentPrompt = (currentContent: string | null) =>
  `\
Improve the following spreadsheet based on the given prompt.

${currentContent}
`;

export async function updateSheetContent(
  currentContent: string,
  description: string,
  onDelta: (delta: string) => void,
): Promise<string> {
  let draftContent = '';

  const { fullStream } = streamObject({
    model: llmProvider.artifact(),
    system: updateDocumentPrompt(currentContent),
    prompt: description,
    schema: z.object({
      csv: z.string(),
    }),
  });

  for await (const delta of fullStream) {
    if (delta.type === 'object' && delta.object.csv) {
      draftContent = delta.object.csv;
      onDelta(delta.object.csv);
    }
  }

  return draftContent;
}
