import Editor from '../components/editor';
import 'prosekit/basic/style.css';
import 'prosekit/basic/typography.css';
import { useNuwaClient } from '@nuwa-ai/ui-kit';
import { createEditor } from 'prosekit/core';
import { useMemo, useState } from 'react';
import { defineExtension } from '@/components/editor/extension';
import {
    htmlFromMarkdown,
    markdownFromHTML,
} from '@/components/editor/markdown';
import { NuwaClientProvider } from '@/contexts/NuwaClientContext';
import { useNoteMCP } from '../hooks/use-note-mcp';

export default function EditorPage() {
    const [isLoading, setIsLoading] = useState(true);

    // Create a single ProseKit editor instance
    const editor = useMemo(() => {
        const extension = defineExtension();
        return createEditor({ extension });
    }, []);

    // Connect to Nuwa Client on mount and obtain nuwa client methods
    const { nuwaClient } = useNuwaClient({
        onError: (error) => {
            console.error('Nuwa client error:', error);
        },
        onConnected: async () => {
            try {
                const savedData = await nuwaClient.getState<{ noteContent?: string }>();

                // If there is saved markdown content, convert to HTML and set editor content
                if (savedData?.noteContent) {
                    const html = htmlFromMarkdown(savedData.noteContent);
                    // Set content directly on the existing editor instance
                    editor.setContent(html, 'end');
                }
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
                console.error('Failed to load saved content:', error);
            }
        },
        debug: false,
    });

    // Start MCP server for Nuwa Client to connect (ProseKit-compatible)
    useNoteMCP(editor, nuwaClient);

    const handleOnChange = async () => {
        // Serialize the current document to HTML, then to markdown for persistence
        const html = editor.getDocHTML();
        const markdown = markdownFromHTML(html);
        try {
            await nuwaClient.saveState({ noteContent: markdown });
        } catch (error) {
            console.error('Failed to save note:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <NuwaClientProvider nuwaClient={nuwaClient}>
            <Editor editor={editor} onDocChange={handleOnChange} />
        </NuwaClientProvider>
    );
}
