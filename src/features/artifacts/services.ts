import type { Cap } from '@nuwa-ai/cap-kit';
import type { StreamAIRequest } from '@nuwa-ai/ui-kit';
import { stepCountIs, streamText } from 'ai';
import { defaultCap } from '@/shared/constants/cap';
import { CapResolve } from '@/shared/services/cap-resolve';
import { llmProvider } from '@/shared/services/llm-providers';
import { generateUUID } from '@/shared/utils';
import { useCapStore } from '../cap-store/stores';
import { ArtifactSessionsStore } from './stores';

// Handle AI request from artifact
export const CreateAIStream = async ({
  artifactId,
  request,
}: {
  artifactId: string;
  request: StreamAIRequest;
}) => {
  let cap: Cap;
  if (request.capId) {
    cap = await useCapStore.getState().downloadCapByIDWithCache(request.capId);
  } else {
    cap = defaultCap;
  }
  // Resolve cap configuration

  const capResolve = new CapResolve(cap);
  const { prompt, model, tools } = await capResolve.getResolvedConfig();

  // create payment CTX id header
  const paymentCtxId = generateUUID();
  const headers = {
    'X-Client-Tx-Ref': paymentCtxId,
  };

  const { addPaymentCtxIdToArtifactSession } = ArtifactSessionsStore.getState();
  await addPaymentCtxIdToArtifactSession(artifactId, {
    type: 'stream-request',
    ctxId: paymentCtxId,
    message: request.prompt,
    timestamp: Date.now(),
  });

  return streamText({
    model: llmProvider.chat(model),
    system: prompt,
    prompt: request.prompt,
    tools: tools,
    maxRetries: 3,
    stopWhen: stepCountIs(10),
    headers,
    onError: (error: any) => {
      throw new Error(error);
    },
  });
};
