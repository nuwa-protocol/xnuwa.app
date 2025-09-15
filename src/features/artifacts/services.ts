import type { Cap } from '@nuwa-ai/cap-kit';
import { stepCountIs, streamText } from 'ai';
import { CapResolve } from '@/shared/services/cap-resolve';
import { llmProvider } from '@/shared/services/llm-providers';
import { generateUUID } from '@/shared/utils';
import { handleError } from '@/shared/utils/handl-error';

// Handle AI request, entrance of the AI workflow
export const CreateAIStream = async ({
  artifactId,
  signal,
  cap,
}: {
  artifactId: string;
  signal?: AbortSignal;
  cap: Cap;
}) => {
  // Resolve cap configuration
  const capResolve = new CapResolve(cap);
  const { prompt, model, tools } = await capResolve.getResolvedConfig();

  // create payment CTX id header
  const paymentCtxId = generateUUID();
  const headers = {
    'X-Client-Tx-Ref': paymentCtxId,
  };

  // TODO: add payment info to artifact session
  //   await addPaymentCtxIdToArtifactSession(artifactId, {
  //   });

  return streamText({
    model: llmProvider.chat(model),
    system: prompt,
    messages: [],
    tools: tools,
    abortSignal: signal,
    maxRetries: 3,
    stopWhen: stepCountIs(10),
    headers,
    onError: (error: any) => {
      handleError(error);
    },
  });
};
