import { experimental_generateImage } from 'ai';
import { llmProvider } from '@/features/ai-chat/services/providers';

export async function generateImageContent(
  title: string,
  onComplete: (imageBase64: string) => void,
): Promise<string> {
  const { image } = await experimental_generateImage({
    model: llmProvider.image(),
    prompt: title,
    n: 1,
  });

  const base64Content = image.base64;
  onComplete(base64Content);
  return base64Content;
}
