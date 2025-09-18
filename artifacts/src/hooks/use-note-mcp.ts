// Note: suggestion plugin integration only; cursor helpers removed
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type NuwaClient, PostMessageMCPTransport } from '@nuwa-ai/ui-kit';
import type { Editor } from 'prosekit/core';
import { applySuggestion } from '@/components/editor/suggestions';
import { useEffect } from 'react';
import { z } from 'zod';
import type { EditorExtension } from '@/components/editor/extension';
import {
  htmlFromMarkdown,
  markdownFromHTML,
} from '@/components/editor/markdown';

/**
 * Creates an MCP server for ProseKit editor integration
 * @param editor The ProseKit editor instance
 * @returns Object containing the MCP server and transport
 */
const createNoteMCP = (
  editor: Editor<EditorExtension>,
  nuwaClient: NuwaClient,
) => {
  const transport = new PostMessageMCPTransport({
    targetWindow: window.parent,
    targetOrigin: '*',
    allowedOrigins: ['*'],
    debug: true,
    timeout: 10000,
  });

  // Initialize MCP server
  const server = new McpServer({
    name: 'note-editor-mcp',
    version: '2.0.0',
  });

  // Tool 1: Get Markdown Content
  server.registerTool(
    'get_markdown_content',
    {
      title: 'Get Markdown Content',
      description: 'Serialize the current document to Markdown',
      inputSchema: {},
    },
    async () => {
      const html = editor.getDocHTML();
      const md = markdownFromHTML(html);
      return { content: [{ type: 'text', text: md }] };
    },
  );

  // Tool 2: Edit Content (Suggestions)
  // Accepts an array of suggestions only.
  server.registerTool(
    'edit_content',
    {
      title: 'Edit Content (Suggestions)',
      description:
        'Propose edits as suggestion marks so the user can accept or reject them. Use empty strings to express pure insert/delete: set textToReplace="" with anchors to insert only, or set textReplacement="" to delete only. Applies one or more text suggestions.',
      inputSchema: {
        suggestions: z
          .array(
            z.object({
              textToReplace: z
                .string()
                .describe(
                  'Plaintext to replace. For pure insert, set to empty string and provide textBefore or textAfter as an anchor.',
                ),
              textReplacement: z
                .string()
                .describe('The new text to insert. For pure delete, set to empty string.'),
              reason: z
                .string()
                .describe('Optional reason/annotation for the suggestion.'),
              textBefore: z
                .string()
                .describe(
                  'Optional context that must appear immediately before textToReplace to qualify as a match.',
                ),
              textAfter: z
                .string()
                .describe(
                  'Optional context that must appear immediately after textToReplace to qualify as a match.',
                ),
            }),
          )
          .describe(
            'List of text suggestions to apply; each becomes a suggestion mark that the user can accept or reject.',
          )
          .optional(),
      },
    },
    async ({ suggestions }) => {
      const view = editor.view;
      const list = [] as Array<{
        textToReplace: string;
        textReplacement: string;
        reason?: string;
        textBefore?: string;
        textAfter?: string;
      }>;
      if (Array.isArray(suggestions)) list.push(...suggestions);

      if (list.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                applied: 0,
                reason: 'No suggestions provided',
              }),
            },
          ],
        };
      }

      let applied = 0;
      for (const s of list) {
        const ok = applySuggestion(view, s, 'AI');
        if (ok) applied += 1;
      }
      const success = applied > 0;
      const message = success
        ? { success, applied }
        : { success, applied, reason: 'No suggestions applied' };
      return { content: [{ type: 'text', text: JSON.stringify(message) }] };
    },
  );

  // Tool 3: Generate AI Content At End (Stream)
  server.registerTool(
    'generate_ai_content',
    {
      title: 'Generate AI Content (Append to End)',
      description:
        'Stream AI-generated content and append it to the end of the document',
      inputSchema: {
        prompt: z.string().describe('Prompt for AI to generate content'),
        replaceExistingContent: z
          .boolean()
          .describe(
            'Replace existing content with new content. False means adding new content to the end of the document.',
          ),
      },
    },
    async ({ prompt, replaceExistingContent }) => {
      const stream = nuwaClient.createAIStream({ prompt });

      // Maintain a growing markdown buffer and an initial document HTML snapshot
      // taken at the start of streaming. We re-render doc = initial + parsed(md)
      // on each chunk so markdown structure is always accurate.
      let mdBuffer = '';
      const initialHTML = editor.getDocHTML();

      const { result } = await stream.execute({
        onChunk: (chunk) => {
          // Accumulate stream into markdown buffer
          const delta = chunk.content ?? '';
          if (!delta) return;
          mdBuffer += delta;

          // Convert markdown -> html and re-render the full doc as
          // initialHTML + streamedHTML. This ensures partially-closed markdown
          // formats correctly once closed by later chunks.
          const streamedHTML = htmlFromMarkdown(mdBuffer);
          const nextHTML = `${initialHTML}${streamedHTML}`;
          if (replaceExistingContent) {
            editor.setContent(nextHTML, 'start');
          } else {
            editor.setContent(nextHTML, 'end');
          }
        },
        onError: (error) => {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  reason: `Error generating AI content: ${error}`,
                }),
              },
            ],
            isError: true,
          };
        },
      });
      // Done streaming, return success
      return {
        content: [
          {
            type: 'text',
            text: `content added: ${result}`,
          },
        ],
        isError: false,
      };
    },
  );

  return { server, transport };
};

export const useNoteMCP = (
  editor: Editor<EditorExtension>,
  nuwaClient: NuwaClient,
) => {
  // Initialize MCP server
  useEffect(() => {
    const { server, transport } = createNoteMCP(editor, nuwaClient);
    try {
      // Connect server to transport
      server.connect(transport);
    } catch (error) {
      console.error('MCP server error:', error);
    }

    // clean up on unmount
    return () => {
      server.close();
    };
  }, []);
};
