import { streamObject } from 'ai';
import { z } from 'zod';
import { llmProvider } from '@/features/ai-provider/services';

export const sheetPrompt = `
You are a spreadsheet creation assistant. Create a spreadsheet in csv format based on the given prompt. The spreadsheet should contain meaningful column headers and data.
`;

export async function generateSheetContent(
  title: string,
  onDelta: (delta: string) => void,
): Promise<string> {
  let draftContent = '';

  const { fullStream } = streamObject({
    model: llmProvider.artifact(),
    system: sheetPrompt,
    prompt: title,
    schema: z.object({
      csv: z.string().describe('CSV data'),
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
