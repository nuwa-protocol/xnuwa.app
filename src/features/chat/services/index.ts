import { handleAIRequest } from './handler';

export const createClientAIFetch = (): ((
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>) => {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    if (!init || !init.body) {
      throw new Error('Request body is required');
    }

    const requestBody = JSON.parse(init.body as string);
    const { id: chatId, messages } = requestBody;

    const response = await handleAIRequest({
      chatId,
      messages,
      signal: init?.signal ?? undefined,
    });

    return response;
  };
};

export { generateTitleFromUserMessage } from './utility-ai';
