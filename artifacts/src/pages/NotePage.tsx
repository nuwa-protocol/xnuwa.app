import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { useNuwaClient } from "@nuwa-ai/ui-kit";
import { useNoteMCP } from "../hooks/use-note-mcp";
import "@blocknote/mantine/style.css";
import { useState } from "react";

export default function NotePage() {
  const [isLoading, setIsLoading] = useState(true);

  // create blocknote editor
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "heading",
        content: "Hello World!",
        props: {
          level: 1,
        },
      },
    ],
  });

  // connect to Nuwa Client on mount and obtain nuwa client methods
  const { nuwaClient } = useNuwaClient({
    onError: (error) => {
      console.error("Nuwa client error:", error);
    },
    onConnected: async () => {
      try {
        const savedData = await nuwaClient.getState();
        if (savedData?.noteContent) {
          editor.replaceBlocks(editor.document, savedData.noteContent);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load saved content:", error);
      }
    },
  });

  // start MCP server for Nuwa Client to connect
  useNoteMCP(editor);

  const handleSendPrompt = async () => {
    const content = JSON.stringify(editor.document);
    try {
      await nuwaClient.sendPrompt(`Here's my note content: ${content}`);
    } catch (error) {
      console.error("Failed to send note:", error);
    }
  };

  const handleAddSelection = async () => {
    const content = JSON.stringify(editor.document);
    try {
      await nuwaClient.addSelection("Note Content", content);
    } catch (error) {
      console.error("Failed to add note selection:", error);
    }
  };

  const handleOnChange = async () => {
    const content = editor.document;
    try {
      await nuwaClient.saveState({ noteContent: content });
    } catch (error) {
      console.error("Failed to save note:", error);
    }
  };

  const handleGetState = async () => {
    try {
      const state = await nuwaClient.getState();
      if (state?.noteContent) {
        editor.replaceBlocks(editor.document, state.noteContent);
      }
    }
    catch (error) {
      console.error("Failed to get state:", error);
    }
  };

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  }

  return (
    <div className="h-screen w-screen flex flex-col max-w-5xl mx-auto bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-800">Note Editor</h1>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleSendPrompt}
              className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300  transition-colors"
            >
              Send Prompt
            </button>
            <button
              type="button"
              onClick={handleAddSelection}
              className="px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:bg-gray-300  transition-colors"
            >
              Add Selection
            </button>
            <button
              type="button"
              onClick={handleGetState}
              className="px-3 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 disabled:bg-gray-300  transition-colors"
            >
              Get State
            </button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <div className="flex-1 py-10 px-6 bg-white">
        <BlockNoteView editor={editor} theme={'light'} onChange={handleOnChange} />
      </div>
    </div>
  );
}
