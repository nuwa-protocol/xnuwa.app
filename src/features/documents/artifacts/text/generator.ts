import { smoothStream, streamText } from 'ai';
import { myProvider } from '@/features/ai-chat/services';

export async function generateTextContent(
  title: string,
  onDelta: (delta: string) => void,
): Promise<string> {
  let draftContent = '';

  const { fullStream } = streamText({
    model: myProvider.languageModel('artifact-model'),
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