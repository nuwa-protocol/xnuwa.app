import type { UIMessage, UIMessageStreamWriter } from 'ai';
import type OpenAI from 'openai';

type ChatCompletionChunk = OpenAI.Chat.Completions.ChatCompletionChunk;
type ChatCompletionMessageParam =
  OpenAI.Chat.Completions.ChatCompletionMessageParam;
type ChatCompletionTool = OpenAI.Chat.Completions.ChatCompletionTool;

/**
 * Convert Vercel AI SDK UIMessage[] to OpenAI ChatCompletionMessageParam[]
 */
export function convertUIMessagesToOpenAIMessages(
  messages: UIMessage[],
): ChatCompletionMessageParam[] {
  return messages.map((message): ChatCompletionMessageParam => {
    switch (message.role) {
      case 'user':
        return {
          role: 'user',
          content: extractContentFromParts(message.parts || []),
        };

      case 'assistant': {
        const assistantMessage: any = {
          role: 'assistant',
          content: extractTextContent(message.parts || []),
        };

        // Handle tool calls if present
        const toolCalls = extractToolCalls(message.parts || []);
        if (toolCalls.length > 0) {
          assistantMessage.tool_calls = toolCalls;
        }

        return assistantMessage;
      }

      case 'system':
        return {
          role: 'system',
          content: extractTextContent(message.parts || []),
        };

      default:
        // Fallback for other message types including tool
        if (message.role === 'tool') {
          // Handle tool messages - look for result in parts
          return {
            role: 'tool' as any,
            content: extractToolResult(message.parts || []),
            tool_call_id: 'unknown', // Will be handled by the UI components
          };
        }

        return {
          role: message.role as any,
          content: extractTextContent(message.parts || []),
        };
    }
  });
}

/**
 * Extract text content from UIMessage parts
 */
function extractTextContent(parts: any[]): string {
  return parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

/**
 * Extract multimodal content from UIMessage parts for user messages
 */
function extractContentFromParts(parts: any[]): string | any[] {
  if (parts.length === 0) return '';

  // If only text parts, return as string
  const textParts = parts.filter((part) => part.type === 'text');
  if (textParts.length === parts.length) {
    return textParts.map((part) => part.text).join('');
  }

  // Mixed content - return as array for multimodal
  return parts.map((part) => {
    switch (part.type) {
      case 'text':
        return {
          type: 'text',
          text: part.text,
        };
      case 'image':
        return {
          type: 'image_url',
          image_url: {
            url: part.image, // Assuming base64 or URL
          },
        };
      default:
        return {
          type: 'text',
          text: `[${part.type} content]`, // Fallback
        };
    }
  });
}

/**
 * Extract tool calls from assistant message parts
 */
function extractToolCalls(parts: any[]): any[] {
  return parts
    .filter((part) => part.type === 'tool-call')
    .map((part) => ({
      id: part.toolCallId,
      type: 'function',
      function: {
        name: part.toolName,
        arguments: JSON.stringify(part.args),
      },
    }));
}

/**
 * Extract tool result from tool message parts
 */
function extractToolResult(parts: any[]): string {
  const resultPart = parts.find((part) => part.type === 'tool-result');
  return resultPart ? JSON.stringify(resultPart.result) : '';
}

/**
 * Convert Vercel AI SDK tools to OpenAI format
 */
export function convertToolsToOpenAI(tools: any[]): ChatCompletionTool[] {
  if (!tools) return [];

  return tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.function?.name || tool.name,
      description: tool.function?.description || tool.description,
      parameters: tool.function?.parameters || tool.parameters,
    },
  }));
}

/**
 * Convert OpenAI streaming chunks to UIMessage format for writer
 * This mimics the behavior of streamText().toUIMessageStream()
 */
export function writeOpenaAIChunkToUIMessageStream(
  chunk: ChatCompletionChunk,
  writer: UIMessageStreamWriter<UIMessage>,
) {
  const choice = chunk.choices?.[0];
  if (!choice) return;

  const { delta, finish_reason } = choice;

  // Handle text content
  if (delta?.content) {
    writer.write({
      type: 'text-delta',
      delta: delta.content,
      id: 'response',
    });
  }

  // Handle tool calls
  if (delta?.tool_calls) {
    const toolCall = delta.tool_calls[0];
    if (toolCall?.function && toolCall.id && toolCall.function.name) {
      writer.write({
        type: 'tool-call-delta',
        toolCallId: toolCall.id,
        toolName: toolCall.function.name,
        argsTextDelta: toolCall.function.arguments || '',
      } as any);
    }
  }

  // Handle finish reason
  if (finish_reason) {
    return {
      type: 'finish',
      finishReason: finish_reason,
    };
  }
}
