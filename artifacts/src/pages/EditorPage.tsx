import Editor from '../components/editor';
import 'prosekit/basic/style.css';
import 'prosekit/basic/typography.css';
import { useNuwaClient } from '@nuwa-ai/ui-kit';
import { createEditor } from 'prosekit/core';
import {
    applySuggestion,
    type TextSuggestion,
} from 'prosemirror-suggestion-mode';
import { useMemo, useState } from 'react';
import { defineExtension } from '@/components/editor/extension';
import {
    htmlFromMarkdown,
    markdownFromHTML,
} from '@/components/editor/markdown';
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

    // Get selected plain text from the document
    const getSelectedText = () => {
        const { doc, selection } = editor.state;
        if (selection.empty) return '';
        // Use textBetween to extract text content between positions
        return doc.textBetween(selection.from, selection.to, '\n');
    };

    const handleImproveWithAI = async () => {
        try {
            const selection = getSelectedText();
            await nuwaClient.sendPrompt(
                `Please improve the following content: ${JSON.stringify(selection)}`,
            );
        } catch (error) {
            console.error('Failed to send improve-with-AI prompt:', error);
        }
    };

    const handleAddSelection = async () => {
        try {
            const selectedText = getSelectedText();
            await nuwaClient.addSelection(selectedText || 'Selection', selectedText);
        } catch (error) {
            console.error('Failed to add note selection:', error);
        }
    };

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

    const handleLoadMockContent = () => {
        const md = `# ProseMirror Suggestion Demo\n\nThis editor demonstrates suggestion mode features.\nWe will replace certain words and phrases to show how suggestions work.\nYou can accept or reject the changes using the toolbar buttons.\n\n- Cats are wonderful pets.\n- The quick brown fox jumps over the lazy dog.\n- JavaScript is a fun language.`;
        const html = htmlFromMarkdown(md);
        editor.setContent(html, 'end');
    };

    const handleApplyMockSuggestions = () => {
        const suggestions: TextSuggestion[] = [

            {
                textToReplace: 'wonderful ',
                textReplacement: ' ',
                reason: 'Remove adjective',
            },
            {
                textToReplace: 'JavaScript',
                textReplacement: 'TypeScript',
                reason: 'Use TypeScript',
            },
        ] as const;

        for (const s of suggestions) {
            applySuggestion(editor.view, s as any, 'AI');
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
        <div className="h-screen w-screen flex flex-col max-w-5xl mx-auto bg-white">
            <div className="flex justify-end gap-2 p-4">
                <button
                    type="button"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-md border"
                    onClick={handleLoadMockContent}
                >
                    Load Mock Content
                </button>
                <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                    onClick={handleApplyMockSuggestions}
                >
                    Apply Mock Suggestions
                </button>
            </div>
            <div className="flex-1 py-4 px-4">
                <Editor editor={editor} onDocChange={handleOnChange} />
            </div>
        </div>
    );
}
