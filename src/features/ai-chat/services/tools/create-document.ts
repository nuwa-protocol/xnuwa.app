import { tool } from 'ai';
import { z } from 'zod';
import { generateCodeContent } from '@/features/documents/artifacts/code';
import { generateImageContent } from '@/features/documents/artifacts/image';
import { generateSheetContent } from '@/features/documents/artifacts/sheet';
import { generateTextContent } from '@/features/documents/artifacts/text';
import { DocumentStateStore } from '@/features/documents/stores';
import { generateUUID } from '@/shared/utils';

// const artifactKinds = ['text', 'code', 'image', 'sheet'] as const;
const artifactKinds = ['text'] as const;

// generate function mapping
const generators = {
  text: generateTextContent,
  code: generateCodeContent,
  sheet: generateSheetContent,
  image: generateImageContent,
};

export const createDocument = () =>
  tool({
    description:
      'Create a document for a writing or content creation activities. This will generate content using AI and save it locally.',
    parameters: z.object({
      title: z.string(),
      kind: z.enum(artifactKinds),
    }),
    execute: async ({ title, kind }) => {
      const id = generateUUID();
      const { setCurrentDocument } = DocumentStateStore.getState();

      try {
        // create initial document
        const { createDocumentWithId, setDocumentContent } =
          DocumentStateStore.getState();
        createDocumentWithId(id, title, kind);

        // set artifact to streaming state
        setCurrentDocument((artifact) => ({
          ...artifact,
          documentId: id,
          title,
          kind,
          content: '',
          status: 'streaming',
        }));

        // get the corresponding generator
        const generator = generators[kind];
        if (!generator) {
          throw new Error(`No generator found for kind: ${kind}`);
        }

        let finalContent = '';

        // call the AI generate function, update artifact content in real time
        if (kind === 'text') {
          finalContent = await (generator as typeof generateTextContent)(
            title,
            (delta) => {
              setCurrentDocument((artifact) => ({
                ...artifact,
                content: artifact.content + delta,
                status: 'streaming',
              }));
            },
          );
        } else if (kind === 'code') {
          finalContent = await (generator as typeof generateCodeContent)(
            title,
            (delta) => {
              setCurrentDocument((artifact) => ({
                ...artifact,
                content: delta,
                status: 'streaming',
              }));
            },
          );
        } else if (kind === 'sheet') {
          finalContent = await (generator as typeof generateSheetContent)(
            title,
            (delta) => {
              setCurrentDocument((artifact) => ({
                ...artifact,
                content: delta,
                status: 'streaming',
              }));
            },
          );
        } else if (kind === 'image') {
          finalContent = await (generator as typeof generateImageContent)(
            title,
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
        setDocumentContent(id, finalContent);

        setCurrentDocument((artifact) => ({
          ...artifact,
          content: finalContent,
          status: 'idle',
        }));

        return {
          id,
          title,
          kind,
          content: finalContent,
          message: `A ${kind} document "${title}" has been created and saved locally.`,
        };
      } catch (error) {
        console.error('Failed to create document:', error);
        // delete failed document and reset artifact state
        DocumentStateStore.getState().deleteDocument(id);
        setCurrentDocument((artifact) => ({
          ...artifact,
          status: 'idle',
        }));
        throw error;
      }
    },
  });
