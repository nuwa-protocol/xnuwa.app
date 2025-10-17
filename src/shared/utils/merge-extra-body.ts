function tryParseJsonObject(
  payload: string,
): Record<string, unknown> | undefined {
  try {
    const parsed = JSON.parse(payload);
    return typeof parsed === 'object' &&
      parsed !== null &&
      !Array.isArray(parsed)
      ? parsed
      : undefined;
  } catch {
    return undefined;
  }
}

export function mergeRequestBody(
  init: RequestInit | undefined,
  extraBody?: Record<string, unknown>,
) {
  if (!extraBody || Object.keys(extraBody).length === 0) {
    return init;
  }

  const mergedInit: RequestInit = init ? { ...init } : {};
  const existingBody = mergedInit.body;

  if (
    existingBody !== undefined &&
    existingBody !== null &&
    typeof existingBody !== 'string'
  ) {
    return init;
  }

  const baseBody =
    typeof existingBody === 'string' && existingBody.length > 0
      ? tryParseJsonObject(existingBody)
      : {};

  if (typeof baseBody !== 'object' || baseBody === null) {
    return init;
  }

  const baseTools = Array.isArray((baseBody as any).tools)
    ? (baseBody as any).tools
    : [];
  const extraTools = Array.isArray((extraBody as any).tools)
    ? (extraBody as any).tools
    : [];

  const mergedBody: Record<string, unknown> = {
    ...baseBody,
    ...extraBody,
  };

  if (baseTools.length > 0 || extraTools.length > 0) {
    mergedBody.tools = [...baseTools, ...extraTools];
  }

  if ('tool_choice' in extraBody) {
    mergedBody.tool_choice = (extraBody as Record<string, unknown>)[
      'tool_choice'
    ];
  }

  mergedInit.body = JSON.stringify(mergedBody);

  const headers = new Headers(mergedInit.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  mergedInit.headers = headers;

  return mergedInit;
}
