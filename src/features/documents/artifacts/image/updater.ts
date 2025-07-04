import { experimental_generateImage } from 'ai';
import { llmProvider } from '@/features/ai-provider/services';

export async function updateImageContent(
  description: string,
  onComplete: (imageBase64: string) => void,
): Promise<string> {
  const { image } = await experimental_generateImage({
    model: llmProvider.image(),
    prompt: description,
    n: 1,
  });

  const base64Content = image.base64;
  onComplete(base64Content);
  return base64Content;
}
