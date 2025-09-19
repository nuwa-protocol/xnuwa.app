import { ArtifactSchema } from './types';

export const NoteArtifact = ArtifactSchema.parse({
  id: 'did::nuwa::123::note',
  authorDID: 'did::nuwa::123',
  idName: 'note_artifact',
  core: {
    prompt: {
      value: 'You are a note-taking assistant.',
    },
    source: 'http://localhost:3000/editor',
    recomendedCaps: [],
  },
  metadata: {
    displayName: 'Note',
    description: 'A note-taking artifact',
    tags: ['note', 'content editor'],
    homepage: 'http://localhost:3000/editor',
    repository: 'http://localhost:3000/editor',
    thumbnail: 'http://localhost:3000/editor/thumbnail.png',
  },
});
