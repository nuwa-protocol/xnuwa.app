import { generateText, type Message } from 'ai';
import { myProvider } from './providers';

// Generate a title from the first message a user begins a conversation with
// TODO: currently still using the remote AI models, need to switch to local models
export async function generateTitleFromUserMessage({
  message,
}: { message: Message }) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
        - you will generate a short title based on the first message a user begins a conversation with
        - ensure it is not more than 80 characters long
        - the title should be a summary of the user's message
        - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}
