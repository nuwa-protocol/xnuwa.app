import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import {
  experimental_createMCPClient as createMCPClient,
  type experimental_MCPClient as MCPClient,
  type Tool,
  type ToolCallOptions,
} from 'ai';
import type { LocalAccount } from 'viem';
import { createPaymentHeader } from 'x402/client';
import { decodeXPaymentResponse } from 'x402/shared';
import { type ZodType, z } from 'zod';
import {
  markX402PaymentResult,
  recordX402PaymentAttempt,
} from './x402-transaction-store';
import {
  network as defaultNetwork,
  getCurrentAccount,
  type SupportedNetwork,
} from './x402-wallet';

export const x402Version = 1;

interface MCPClientInternal extends MCPClient {
  // Private methods
  request: <T extends ZodType<object>>(params: {
    request: any;
    resultSchema: T;
    options?: any;
  }) => Promise<z.infer<T>>;
  assertCapability: (method: string) => void;
  isClosed: boolean;
}

async function callToolWithPayment(
  client: MCPClientInternal,
  name: string,
  args: Record<string, unknown>,
  paymentAuthorization: string,
  options?: ToolCallOptions,
) {
  // Access private methods
  const request = client.request.bind(client);
  const assertCapability = client.assertCapability.bind(client);

  if (client.isClosed) {
    throw new Error('Attempted to send a request from a closed client');
  }

  assertCapability('tools/call');

  return request({
    request: {
      method: 'tools/call',
      params: {
        name,
        arguments: args,
        _meta: {
          'x402/payment': paymentAuthorization,
        },
      },
    },
    resultSchema: CallToolResultSchema,
    options: {
      signal: options?.abortSignal,
    },
  });
}

export interface ClientPaymentOptions {
  account: LocalAccount;
  maxPaymentValue?: bigint;
  network: SupportedNetwork;
}

const EvmAddressRegex = /^0x[0-9a-fA-F]{40}$/;
const DefaultMaxPaymentValue = 100_000n; // 0.10 USDC (USDC has 6 decimals)
const MaxTimeoutSchema = z
  .union([z.number(), z.string()])
  .transform((value) => {
    const parsed =
      typeof value === 'string' ? Number.parseInt(value, 10) : value;
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      throw new Error('maxTimeoutSeconds must be an integer');
    }
    return parsed;
  });

const PaymentRequirementSchema = z.object({
  scheme: z.literal('exact'),
  network: z.enum(['x-layer-testnet', 'x-layer']),
  maxAmountRequired: z.union([z.string(), z.number()]),
  resource: z.string(),
  description: z.string().optional(),
  mimeType: z.string(),
  outputSchema: z.record(z.any()).optional(),
  payTo: z.string().regex(EvmAddressRegex),
  maxTimeoutSeconds: MaxTimeoutSchema,
  asset: z.string().regex(EvmAddressRegex),
  extra: z.unknown().optional(),
});

const PaymentErrorSchema = z.object({
  x402Version: z.literal(x402Version),
  error: z.string(),
  accepts: z.array(PaymentRequirementSchema),
});

type PaymentRequirement = z.infer<typeof PaymentRequirementSchema>;
const paymentLogPrefix = '[x402/payment]';

function logPaymentEvent(
  message: string,
  details?: Record<string, string | number | undefined>,
) {
  if (details) {
    console.info(`${paymentLogPrefix} ${message}`, details);
  } else {
    console.info(`${paymentLogPrefix} ${message}`);
  }
}

const parseAssetDecimals = (extra: unknown): number | undefined => {
  if (!extra || typeof extra !== 'object') return undefined;
  const maybeDecimals = (extra as Record<string, unknown>).assetDecimals;
  return typeof maybeDecimals === 'number' && Number.isInteger(maybeDecimals)
    ? maybeDecimals
    : undefined;
};

const extractCtxId = (
  toolOptions: ToolCallOptions | undefined,
  requirement: PaymentRequirement,
): string | undefined => {
  if (toolOptions?.toolCallId) {
    return toolOptions.toolCallId;
  }
  if (requirement.extra && typeof requirement.extra === 'object') {
    const extra = requirement.extra as Record<string, unknown>;
    const direct = extra.ctxId ?? extra.clientTxRef;
    if (typeof direct === 'string') {
      return direct;
    }
  }
  return undefined;
};

const safeRecord = async (fn: () => Promise<void>) => {
  try {
    await fn();
  } catch (error) {
    console.warn('[x402/tx-store] Failed to record MCP transaction', error);
  }
};

const extractPaymentResponseMeta = (
  result: unknown,
): { serviceTxRef?: string; metadata?: unknown } | undefined => {
  if (!result || typeof result !== 'object') {
    return undefined;
  }
  const meta = (result as { _meta?: Record<string, unknown> })._meta;
  if (!meta || typeof meta !== 'object') {
    return undefined;
  }
  const paymentResponse = (meta as Record<string, unknown>)[
    'x402/payment-response'
  ];
  if (!paymentResponse) {
    return undefined;
  }

  let serviceTxRef: string | undefined;
  if (
    paymentResponse &&
    typeof paymentResponse === 'object' &&
    'transaction' in (paymentResponse as Record<string, unknown>)
  ) {
    const txValue = (paymentResponse as Record<string, unknown>).transaction;
    if (typeof txValue === 'string') {
      serviceTxRef = txValue;
    }
  }

  return {
    serviceTxRef,
    metadata: paymentResponse,
  };
};

async function withPayment(
  mcpClient: MCPClient,
  clientOptions: ClientPaymentOptions,
): Promise<MCPClient> {
  const client = mcpClient as MCPClientInternal;
  const maxPaymentValue =
    clientOptions.maxPaymentValue ?? DefaultMaxPaymentValue;

  // Store reference to original tools method before overriding it
  const originalToolsMethod = client.tools.bind(client);

  const wrappedTools: MCPClient['tools'] = async (toolSetOptions) => {
    // Get the original tools from the wrapped client using the stored reference
    const originalTools = await originalToolsMethod(toolSetOptions);
    const wrappedToolsEntries: Array<[string, Tool]> = [];

    // Wrap each tool to add payment support
    for (const [name, tool] of Object.entries(originalTools)) {
      const wrappedTool: Tool = {
        ...tool,
        execute: async (
          args: Record<string, unknown> | undefined,
          toolOptions: ToolCallOptions,
        ) => {
          if (!tool.execute) {
            throw new Error(`Tool ${name} does not have an execute function`);
          }

          const toolArgs = args ?? {};

          const retryWithPayment = async (
            requirement: PaymentRequirement,
            origin: 'response' | 'error',
          ) => {
            logPaymentEvent(`Payment required for tool ${name} (${origin})`, {
              network: requirement.network,
              resource: requirement.resource,
              amount: requirement.maxAmountRequired.toString(),
              payTo: requirement.payTo,
            });
            const paymentAuthorization = await getPaymentAuthorization(
              requirement,
              {
                account: clientOptions.account,
                clientNetwork: clientOptions.network,
                maxPaymentValue,
              },
            );
            logPaymentEvent(`Retrying ${name} with payment`, {
              resource: requirement.resource,
            });
            const ctxId = extractCtxId(toolOptions, requirement);
            if (ctxId) {
              await safeRecord(() =>
                recordX402PaymentAttempt({
                  ctxId,
                  requirement: requirement as any,
                } as any),
              );
            }
            const attemptStartedAt = Date.now();
            try {
              const paidResult = await callToolWithPayment(
                client,
                name,
                toolArgs,
                paymentAuthorization,
                toolOptions,
              );
              if (ctxId) {
                // Try to extract the MCP-provided payment response from result._meta
                let decoded:
                  | ReturnType<typeof decodeXPaymentResponse>
                  | undefined;
                try {
                  if (
                    paidResult &&
                    typeof paidResult === 'object' &&
                    '_meta' in (paidResult as any)
                  ) {
                    const meta = (paidResult as any)._meta;
                    const pr = meta?.['x402/payment-response'];
                    if (typeof pr === 'string') {
                      decoded = decodeXPaymentResponse(pr);
                    } else if (pr && typeof pr === 'object') {
                      decoded = pr as ReturnType<typeof decodeXPaymentResponse>;
                    }
                  }
                } catch (e) {
                  console.warn(
                    '[x402/tx-store] Failed to parse MCP payment response',
                    e,
                  );
                }
                await safeRecord(() =>
                  markX402PaymentResult({
                    ctxId,
                    response: decoded,
                  }),
                );
              }
              return stripPaymentResponseMetadata(paidResult);
            } catch (retryError) {
              if (ctxId) {
                // On error, still attempt to capture any payment response metadata
                let decoded:
                  | ReturnType<typeof decodeXPaymentResponse>
                  | undefined;
                try {
                  if (
                    retryError &&
                    typeof retryError === 'object' &&
                    '_meta' in (retryError as any)
                  ) {
                    const meta = (retryError as any)._meta;
                    const pr = meta?.['x402/payment-response'];
                    if (typeof pr === 'string') {
                      decoded = decodeXPaymentResponse(pr);
                    } else if (pr && typeof pr === 'object') {
                      decoded = pr as ReturnType<typeof decodeXPaymentResponse>;
                    }
                  }
                } catch (e) {
                  console.warn(
                    '[x402/tx-store] Failed to parse MCP payment response (error)',
                    e,
                  );
                }
                await safeRecord(() =>
                  markX402PaymentResult({
                    ctxId,
                    response: decoded,
                  }),
                );
              }
              throw retryError;
            }
          };

          try {
            const result = await tool.execute(toolArgs, toolOptions);

            if (
              !result ||
              typeof result !== 'object' ||
              (result as { isError?: boolean }).isError !== true
            ) {
              return result;
            }

            const paymentRequirements = extractPaymentRequirements(
              result,
              clientOptions.network,
            );

            if (!paymentRequirements) {
              return stripPaymentResponseMetadata(result);
            }

            return retryWithPayment(paymentRequirements, 'response');
          } catch (error) {
            const paymentRequirements = extractPaymentRequirements(
              error,
              clientOptions.network,
            );

            if (!paymentRequirements) {
              throw error;
            }

            return retryWithPayment(paymentRequirements, 'error');
          }
        },
      };
      wrappedToolsEntries.push([name, wrappedTool]);
    }

    return Object.fromEntries(wrappedToolsEntries) as typeof originalTools;
  };

  client.tools = wrappedTools;
  return client;
}

interface PaymentAuthorizationContext {
  account: LocalAccount;
  clientNetwork: ClientPaymentOptions['network'];
  maxPaymentValue: bigint;
}

function parsePaymentPayload(
  payload: unknown,
  network: ClientPaymentOptions['network'],
): PaymentRequirement | null {
  const parsed = PaymentErrorSchema.safeParse(payload);
  if (!parsed.success) {
    return null;
  }

  const matchingRequirement = parsed.data.accepts.find(
    (accept) => accept.network === network,
  );

  return matchingRequirement ?? null;
}

function extractPaymentRequirements(
  response: unknown,
  network: ClientPaymentOptions['network'],
): PaymentRequirement | null {
  if (typeof response === 'string') {
    try {
      const requirement = parsePaymentPayload(JSON.parse(response), network);
      if (requirement) {
        return requirement;
      }
    } catch {
      return null;
    }
  }

  if (!response || typeof response !== 'object') {
    return null;
  }

  const candidatePayloads: unknown[] = [response];
  const responseWithContent = response as {
    structuredContent?: unknown;
    content?: Array<{ type: string; text?: string }>;
    message?: string;
    cause?: unknown;
  };

  if (responseWithContent.structuredContent) {
    candidatePayloads.push(responseWithContent.structuredContent);
  }

  if (Array.isArray(responseWithContent.content)) {
    for (const contentItem of responseWithContent.content) {
      if (
        contentItem?.type === 'text' &&
        typeof contentItem.text === 'string'
      ) {
        try {
          candidatePayloads.push(JSON.parse(contentItem.text));
        } catch {
          // Ignore JSON parse errors; the text may not be JSON.
        }
      }
    }
  }

  if (typeof responseWithContent.message === 'string') {
    try {
      candidatePayloads.push(JSON.parse(responseWithContent.message));
    } catch {
      // Ignore non-JSON messages.
    }
  }

  for (const payload of candidatePayloads) {
    const requirement = parsePaymentPayload(payload, network);
    if (requirement) {
      return requirement;
    }
  }

  if (responseWithContent.cause) {
    return extractPaymentRequirements(responseWithContent.cause, network);
  }

  return null;
}

function stripPaymentResponseMetadata<T>(result: T): T {
  if (!result || typeof result !== 'object') {
    return result;
  }

  const resultRecord = result as Record<string, unknown>;
  const meta = resultRecord._meta;
  if (!meta || typeof meta !== 'object') {
    return result;
  }

  if (!('x402/payment-response' in meta)) {
    return result;
  }

  logPaymentEvent('Stripping payment response metadata from tool result');

  const clonedResult: Record<string, unknown> = { ...resultRecord };
  const clonedMeta = { ...(meta as Record<string, unknown>) };
  delete clonedMeta['x402/payment-response'];

  if (Object.keys(clonedMeta).length === 0) {
    delete clonedResult._meta;
  } else {
    clonedResult._meta = clonedMeta;
  }

  return clonedResult as T;
}

async function getPaymentAuthorization(
  requirement: PaymentRequirement,
  context: PaymentAuthorizationContext,
) {
  const amountRequired = BigInt(requirement.maxAmountRequired.toString());

  if (amountRequired > context.maxPaymentValue) {
    throw new Error('Payment requirements exceed configured max payment value');
  }

  if (requirement.scheme !== 'exact') {
    throw new Error('Only exact payment scheme is supported');
  }

  if (requirement.network !== context.clientNetwork) {
    throw new Error('Unsupported payment network');
  }

  return createPaymentHeader(context.account, x402Version, {
    ...requirement,
    description: requirement.description ?? 'Payment required',
    maxAmountRequired: requirement.maxAmountRequired.toString(),
    extra:
      typeof requirement.extra === 'object' && requirement.extra !== null
        ? (requirement.extra as Record<string, unknown>)
        : undefined,
  } as any);
}

export const createX402MCPClient = async (url: string) => {
  const activeAccount = getCurrentAccount();
  return await createMCPClient({
    transport: new StreamableHTTPClientTransport(new URL(url)),
  }).then((client) =>
    withPayment(client, {
      account: activeAccount,
      network: defaultNetwork,
    }),
  );
};
