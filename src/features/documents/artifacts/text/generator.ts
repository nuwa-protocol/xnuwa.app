import { smoothStream, streamText } from 'ai';
import { llmProvider } from '@/features/ai-chat/services/providers';

export async function generateTextContent(
  title: string,
  onDelta: (delta: string) => void,
): Promise<string> {
  let draftContent = '';

  const { fullStream } = streamText({
    model: llmProvider.artifact(),
    system:
      'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
    experimental_transform: smoothStream({ chunking: 'word' }),
    prompt: title,
  });

  for await (const delta of fullStream) {
    if (delta.type === 'text-delta') {
      const { textDelta } = delta;
      draftContent += textDelta;
      onDelta(textDelta);
    }
  }

  return draftContent;
}
