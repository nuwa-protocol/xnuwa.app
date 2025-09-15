import { BlockNoteView } from '@blocknote/mantine';
import {
  FormattingToolbar,
  FormattingToolbarController,
  getFormattingToolbarItems,
  useCreateBlockNote,
} from '@blocknote/react';
import { useNuwaClient } from '@nuwa-ai/ui-kit';
import { useNoteMCP } from '../hooks/use-note-mcp';
import '@blocknote/mantine/style.css';
import { useState } from 'react';
import '@blocknote/xl-ai/style.css';
import { AddSelectionButton, ImproveWithAIButton } from '@/components/AIButton';


export default function NotePage() {
  const [isLoading, setIsLoading] = useState(true);

  // create blocknote editor
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: 'heading',
        content: 'Hello World!',
        props: {
          level: 1,
        },
      },
    ],
  });

  // connect to Nuwa Client on mount and obtain nuwa client methods
  const { nuwaClient } = useNuwaClient({
    onError: (error) => {
      console.error('Nuwa client error:', error);
    },
    onConnected: async () => {
      try {
        const savedData = await nuwaClient.getState();
        if (savedData?.noteContent) {
          editor.replaceBlocks(editor.document, savedData.noteContent);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error('Failed to load saved content:', error);
      }
    },
    debug: true,
  });

  // start MCP server for Nuwa Client to connect
  useNoteMCP(editor);

  const handleImproveWithAI = async () => {
    try {
      const selection = editor.getSelection();
      if (selection) {
        await nuwaClient.sendPrompt(`Please improve the following content: ${JSON.stringify(selection)}`);
      }
    } catch (error) {
      console.error('Failed to add note selection:', error);
    }
  };

  const handleAddSelection = async () => {

    try {
      const selectedText = editor.getSelectedText();
      const selection = editor.getSelection();
      if (selection) {
        await nuwaClient.addSelection(
          selectedText,
          selection,
        );
      }
    } catch (error) {
      console.error('Failed to add note selection:', error);
    }
  };

  const handleOnChange = async () => {
    const content = editor.document;
    try {
      await nuwaClient.saveState({ noteContent: content });
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
    <div className="h-screen w-screen flex flex-col max-w-5xl mx-auto bg-white">
      {/* Editor */}
      <div className="flex-1 py-10 px-6 bg-white">
        <BlockNoteView
          editor={editor}
          theme={'light'}
          onChange={handleOnChange}
        >
          <FormattingToolbarController
            formattingToolbar={() => (
              <FormattingToolbar>
                {...getFormattingToolbarItems()}
                <AddSelectionButton onClick={handleAddSelection} />
                <ImproveWithAIButton onClick={handleImproveWithAI} />
              </FormattingToolbar>
            )} />
        </BlockNoteView>
      </div>
    </div>
  );
}