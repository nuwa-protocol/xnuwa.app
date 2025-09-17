import Editor from '../components/editor';
import 'prosekit/basic/style.css';
import 'prosekit/basic/typography.css';
import {
    type StreamChunk,
    type StreamHandle,
    useNuwaClient,
} from '@nuwa-ai/ui-kit';
import { createEditor } from 'prosekit/core';
import { useMemo, useState } from 'react';
import { defineExtension } from '@/components/editor/extension';
import {
    htmlFromMarkdown,
    markdownFromHTML,
} from '@/components/editor/markdown';
// NOTE: BlockNote-specific MCP hook is not compatible with ProseMirror/ProseKit
// import { useNoteMCP } from '../hooks/use-note-mcp';

export default function EditorPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [streamHandle, setStreamHandle] = useState<StreamHandle | null>(null);

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

    // TODO: Provide a ProseKit-compatible MCP hook if needed
    // useNoteMCP(editor as any, nuwaClient);

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

    const handleTestStream = async () => {
        const stream = nuwaClient.createAIStream({
            prompt:
                'Please write a simple paragraph about AI. Around 100 words. Anything would be fine.',
        });
        setStreamHandle(stream);
        const { result } = await stream.execute({
            onChunk: (chunk: StreamChunk) => {
                const text = chunk.content ?? '';
                if (!text) return;
                // Insert text at current selection using ProseMirror transaction
                const { state, view } = editor;
                const { from, to } = state.selection;
                const tr = state.tr.insertText(text, from, to);
                view.dispatch(tr);
            },
        });
        console.log(result);
        setStreamHandle(null);
    };

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return <Editor editor={editor} onDocChange={handleOnChange} />;
}
