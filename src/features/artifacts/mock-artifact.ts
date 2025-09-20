import { ArtifactSchema } from './types';

export const NoteArtifact = ArtifactSchema.parse({
  id: 'did::nuwa::123::note',
  authorDID: 'did::nuwa::123',
  idName: 'note_artifact',
  core: {
    prompt: {
      value: 'You are a note-taking assistant.',
    },
    source: 'http://localhost:3000/note-editor',
    recomendedCaps: [],
  },
  metadata: {
    displayName: 'Note',
    description: 'Writing with the help of AI. A note-taking assistant.',
    tags: ['note', 'content editor'],
    homepage: 'http://localhost:3000/note-editor',
    repository: 'http://localhost:3000/note-editor',
    thumbnail: 'http://localhost:3000/thumbnail.png',
  },
});

export const ExcalidrawArtifact = ArtifactSchema.parse({
  id: 'did::nuwa::123::excalidraw',
  authorDID: 'did::nuwa::123',
  idName: 'excalidraw_artifact',
  core: {
    prompt: {
      value: 'You are a drawing assistant.',
    },
    source: 'http://localhost:3000/excalidraw',
    recomendedCaps: [],
  },
  metadata: {
    displayName: 'Excalidraw',
    description: 'Drawing with the help of AI. A drawing assistant.',
    tags: ['drawing', 'content editor'],
    homepage: 'http://localhost:3000/excalidraw',
    repository: 'http://localhost:3000/excalidraw',
    thumbnail: 'http://localhost:3000/excalidraw/thumbnail.png',
  },
});
