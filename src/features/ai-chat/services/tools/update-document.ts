import { tool } from 'ai';
import { z } from 'zod';
import { updateCodeContent } from '@/features/documents/artifacts/code';
import { updateImageContent } from '@/features/documents/artifacts/image';
import { updateSheetContent } from '@/features/documents/artifacts/sheet';
import { updateTextContent } from '@/features/documents/artifacts/text';
import { DocumentStateStore } from '@/features/documents/stores';

// update function mapping
const updaters = {
  text: updateTextContent,
  code: updateCodeContent,
  sheet: updateSheetContent,
  image: updateImageContent,
};

export const updateDocument = () =>
  tool({
    description: 'Update a document with the given description using AI.',
    parameters: z.object({
      id: z.string().describe('The ID of the document to update'),
      description: z
        .string()
        .describe('The description of changes that need to be made'),
    }),
    execute: async ({ id, description }) => {
      const { setCurrentDocument, getDocument, addNewVersionDocument } =
        DocumentStateStore.getState();
      try {
        // Get document from client store
        const document = getDocument(id);

        if (!document) {
          return {
            error: 'Document not found',
          };
        }

        // set artifact to streaming state
        setCurrentDocument((artifact) => ({
          ...artifact,
          documentId: id,
          title: document.title,
          kind: document.kind,
          content: document.content || '',
          status: 'streaming',
        }));

        // get the corresponding updater
        const updater = updaters[document.kind];
        if (!updater) {
          throw new Error(`No updater found for kind: ${document.kind}`);
        }

        let updatedContent = '';

        // call the AI update function, update artifact content in real time
        if (document.kind === 'text') {
          updatedContent = await (updater as typeof updateTextContent)(
            document.content || '',
            description,
            (delta) => {
              setCurrentDocument((artifact) => ({
                ...artifact,
                content: artifact.content + delta,
                status: 'streaming',
              }));
            },
          );
        } else if (document.kind === 'code') {
          updatedContent = await (updater as typeof updateCodeContent)(
            document.content || '',
            description,
            (delta) => {
              setCurrentDocument((artifact) => ({
                ...artifact,
                content: delta,
                status: 'streaming',
              }));
            },
          );
        } else if (document.kind === 'sheet') {
          updatedContent = await (updater as typeof updateSheetContent)(
            document.content || '',
            description,
            (delta) => {
              setCurrentDocument((artifact) => ({
                ...artifact,
                content: delta,
                status: 'streaming',
              }));
            },
          );
        } else if (document.kind === 'image') {
          // image update does not need current content
          updatedContent = await (updater as typeof updateImageContent)(
            description,
            (imageBase64) => {
              setCurrentDocument((artifact) => ({
                ...artifact,
                content: imageBase64,
                status: 'streaming',
              }));
            },
          );
        }

        // update document content and set artifact to idle state
        // setDocumentContent(id, updatedContent);
        addNewVersionDocument(id, updatedContent);

        setCurrentDocument((artifact) => ({
          ...artifact,
          content: updatedContent,
          status: 'idle',
        }));

        return {
          id,
          title: document.title,
          kind: document.kind,
          content: updatedContent,
          message: `The ${document.kind} document "${document.title}" has been updated successfully.`,
        };
      } catch (error) {
        console.error('Failed to update document:', error);
        setCurrentDocument((artifact) => ({
          ...artifact,
          status: 'idle',
        }));
        throw error;
      }
    },
  });
