import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { generateUUID } from '@/shared/utils';
import { useArtifactsStore } from '../stores';

const mock_artifact_source_id = '123';
const mock_artifact_source_url = 'http://localhost:3000/note';
const mock_artifact_title = 'Note';

export const useArtifactPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getArtifact, addArtifact } = useArtifactsStore();
  const [artifactId, setArtifactId] = useState<string | null>(null);

  useEffect(() => {
    const artifactUrlId = searchParams.get('artifact_id');
    // if the url contains artifact_id, check if it exists in the store
    if (artifactUrlId && getArtifact(artifactUrlId)) {
      setArtifactId(artifactUrlId);
    } else {
      // otherwise create a new artifact
      const newArtifactId = generateUUID();
      const newArtifact = {
        id: newArtifactId,
        title: mock_artifact_title,
        source: {
          id: mock_artifact_source_id,
          url: mock_artifact_source_url,
        },
        state: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        payments: [],
      };
      addArtifact(newArtifact);
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
