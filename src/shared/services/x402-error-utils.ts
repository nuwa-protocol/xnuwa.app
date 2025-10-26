export const X_PAYMENT_HEADER_REQUIRED_ERROR = 'X-PAYMENT header is required';

export interface ProcessedX402Error<TRequirement> {
  version: number;
  requirements: TRequirement[];
  errorMessage?: string;
}

type RequirementParser<TRequirement> = (input: unknown) => TRequirement;
type RequirementParserLike<TRequirement> =
  | RequirementParser<TRequirement>
  | {
      parse: RequirementParser<TRequirement>;
    };

export interface ProcessX402ErrorOptions {
  allowHeaderRequiredError?: boolean;
}

export function processX402ErrorPayload<TRequirement>(
  payload: unknown,
  parseRequirement: RequirementParserLike<TRequirement>,
): ProcessedX402Error<TRequirement> {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid x402 error payload');
  }

  const rawPayload = payload as {
    x402Version?: unknown;
    error?: unknown;
    accepts?: unknown;
  };

  if (typeof rawPayload.x402Version !== 'number') {
    throw new Error('x402 error payload is missing a numeric x402Version field');
  }

  if (!Array.isArray(rawPayload.accepts) || rawPayload.accepts.length === 0) {
    throw new Error('x402 error payload does not include payment requirements');
  }

  const maybeParserObject =
    parseRequirement as RequirementParserLike<TRequirement>;

  const parser: RequirementParser<TRequirement> =
    typeof maybeParserObject.parse === 'function'
      ? (value: unknown) =>
          maybeParserObject.parse.call(maybeParserObject, value)
      : (parseRequirement as RequirementParser<TRequirement>);

  const requirements = rawPayload.accepts.map((item, index) => {
    try {
      return parser(item);
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : JSON.stringify(error);
      throw new Error(
        `Failed to parse x402 payment requirement at index ${index}: ${reason}`,
      );
    }
  });

  const errorMessage =
    typeof rawPayload.error === 'string'
      ? rawPayload.error.trim() || undefined
      : undefined;

  return {
    version: rawPayload.x402Version,
    requirements,
    errorMessage,
  };
}

export function validateX402Error<TRequirement>(
  processed: ProcessedX402Error<TRequirement>,
  options: ProcessX402ErrorOptions = {},
): void {
  if (!processed.errorMessage) {
    return;
  }

  const { allowHeaderRequiredError = false } = options;
  if (
    allowHeaderRequiredError &&
    processed.errorMessage === X_PAYMENT_HEADER_REQUIRED_ERROR
  ) {
    return;
  }

  const error = new Error(processed.errorMessage);
  (error as Error & { status?: number }).status = 402;
  throw error;
}

export function parseX402ErrorOrThrow<TRequirement>(
  payload: unknown,
  parseRequirement: RequirementParserLike<TRequirement>,
  options: ProcessX402ErrorOptions = {},
): ProcessedX402Error<TRequirement> {
  const processed = processX402ErrorPayload(payload, parseRequirement);
  validateX402Error(processed, options);
  return processed;
}
