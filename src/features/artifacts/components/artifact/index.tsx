import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useSidebarStore } from '@/features/sidebar/stores';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/shared/components/ui/resizable';
import { useArtifactPage } from '../../hooks/use-artifact-page';
import { Artifact } from './artifact';
import { ArtifactChat } from './artifact-chat';

export const ArtifactMain = () => {
    const { setMode } = useSidebarStore();
    const { artifactId } = useArtifactPage();
    // set the app sidebar to floating mode when showing artifact
    useEffect(() => {
        setMode('floating');
    }, [setMode]);

    if (!artifactId) {
        return <div>Initializing artifact...</div>;
    }

    return (
        <div className="flex w-full h-full">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={35} minSize={20}>
                    <ArtifactChat artifactId={artifactId} />
                </ResizablePanel>
                <ResizableHandle withHandle className="h-4 my-auto" />
                <ResizablePanel
                    defaultSize={65}
                    minSize={50}
                    className="overflow-hidden"
                >
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="h-full border-l-2"
                    >
                        {artifactId && <Artifact artifactId={artifactId} />}
                    </motion.div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};
