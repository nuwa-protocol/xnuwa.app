import { generateText, type UIMessage } from 'ai';
import { llmProvider } from '@/shared/services/llm-providers';
import { generateUUID } from '@/shared/utils';
import { ChatSessionsStore } from '../stores';

// Generate a title from the first message a user begins a conversation with
export async function generateTitleFromUserMessage({
  chatId,
  message,
}: {
  chatId: string;
  message: UIMessage;
}) {
  const { addPaymentCtxIdToChatSession } = ChatSessionsStore.getState();

  // create payment ctx id header
  const paymentCtxId = generateUUID();
  const headers = {
    'X-Client-Tx-Ref': paymentCtxId,
  };

  // add payment info to chat session
  await addPaymentCtxIdToChatSession(chatId, {
    type: 'generate-title',
    ctxId: paymentCtxId,
    timestamp: Date.now(),
  });

  const { text: title } = await generateText({
    model: llmProvider.utility(),
    system: `\n
        - you will generate a short title based on the first message a user begins a conversation with
        - ensure it is not more than 80 characters long
        - the title should be a summary of the user's message
        - do not use quotes or colons`,
    prompt: JSON.stringify(message),
    headers,
  });

  return title;
}
