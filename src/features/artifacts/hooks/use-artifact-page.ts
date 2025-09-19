import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateUUID } from '@/shared/utils';
import { NoteArtifact } from '../mock-artifact';
import { ArtifactSessionsStore } from '../stores';

export const useArtifactPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getArtifactSession, addArtifactSession } = ArtifactSessionsStore();
  const [artifactId, setArtifactId] = useState<string | null>(null);

  useEffect(() => {
    const artifactUrlId = searchParams.get('artifact_id');
    // if the url contains artifact_id, check if it exists in the store
    if (artifactUrlId && getArtifactSession(artifactUrlId)) {
      setArtifactId(artifactUrlId);
    } else {
      // otherwise create a new artifact
      const newArtifactId = generateUUID();
      const newArtifactSession = {
        id: newArtifactId,
        title: 'Untitled Note',
        artifact: NoteArtifact,
        state: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        payments: [],
      };
      addArtifactSession(newArtifactSession);
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('artifact_id', newArtifactId);
      setSearchParams(newSearchParams);
      setArtifactId(newArtifactId);
    }
  }, [searchParams]);

  return {
    artifactId,
  };
};
