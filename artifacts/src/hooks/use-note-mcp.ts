import type { BlockNoteEditor } from '@blocknote/core';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { type NuwaClient, PostMessageMCPTransport } from '@nuwa-ai/ui-kit';
import { useEffect } from 'react';
import { z } from 'zod';

/**
 * Creates an MCP server for BlockNote editor integration
 * @param editor The BlockNote editor instance
 * @returns Object containing the MCP server and transport
 */
const createNoteMCP = (editor: BlockNoteEditor, nuwaClient: NuwaClient) => {
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
    version: '1.0.0',
  });

  // Register tool for editing content in the BlockNote editor
  server.registerTool(
    'add_content',
    {
      title: 'Add some content to the editor with AI stream',
      description: 'Add some content to the editor with AI stream',
      inputSchema: {
        prompt: z
          .string()
          .describe('The prompt for AI to generate the content'),
      },
    },
    async ({ prompt }) => {
      let content = '';
      const stream = nuwaClient.createAIStream({ prompt });
      await stream.execute({
        onChunk: (chunk) => {
          editor.insertInlineContent(chunk.content ?? '');
          content += chunk.content ?? '';
        },
      });
      return {
        content: [
          {
            type: 'text',
            text: `Content added: ${content}`,
          },
        ],
      };
    },
  );

  return { server, transport };
};

export const useNoteMCP = (editor: BlockNoteEditor, nuwaClient: NuwaClient) => {
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
