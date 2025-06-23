import { useWindowSize } from 'usehooks-ts';

export const useArtifactWidth = () => {
  const { width: windowWidth } = useWindowSize();
  const chatSidebarWidth = 400;
  const artifactWidth = windowWidth
    ? windowWidth - chatSidebarWidth
    : `calc(100dvw - ${chatSidebarWidth}px)`;
  return artifactWidth;
};
