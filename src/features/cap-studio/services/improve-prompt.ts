import { generateText } from 'ai';
import { UtilityLLMProvider } from '@/shared/services/llm-providers';
import { generateUUID } from '@/shared/utils';

// Improve a prompt with safe defaults
export async function improvePrompt({ prompt }: { prompt: string }) {
  // TODO: add payment record to some stores
  // create payment ctx id header
  const paymentCtxId = generateUUID();
  const headers = {
    'X-Client-Tx-Ref': paymentCtxId,
  };

  const { text: improved } = await generateText({
    model: UtilityLLMProvider(),
    system: `
You are a world-class prompt engineer.

Task: Rewrite the provided prompt to be clearer, more specific, and easier for an LLM to follow—without changing its original intent.

Requirements:
- Preserve the original meaning, scope, and any constraints.
- Keep the output in the same language as the input.
- Preserve variables/placeholders exactly as written (e.g., {{user_geo}}, {{name}}) and do not rename them.
- Preserve markdown fences and formatting.
- Preserve any custom inline UI syntax exactly (e.g., ![capui:::title](url?param=value)).
- Prefer concise, direct phrasing. Convert vague statements into actionable steps.
- Where appropriate, structure into short sections (e.g., Goal, Context, Instructions, Constraints, Output) only if implied by the input; do not invent details.
- Do not add prefaces, explanations, or quotes—return only the improved prompt text.
`,
    prompt: JSON.stringify(prompt),
    temperature: 0.3,
    headers,
  });

  return improved;
}
