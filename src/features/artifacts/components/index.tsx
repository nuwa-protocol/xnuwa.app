import { useEffect } from 'react';
import { ChatContent } from '@/features/chat/components/chat-content';
import { useSidebarStore } from '@/features/sidebar/stores';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/shared/components/ui/resizable';
import { Artifact } from './artifact';

export const ArtifactMain = () => {
    const { setMode } = useSidebarStore();
    const srcUrl = 'http://localhost:3000/note';

    useEffect(() => {
        setMode('floating');
    }, []);

    return (
        <div className="flex w-full h-full">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={40} minSize={20}>
                    <ChatContent isReadonly={false} />
                </ResizablePanel>
                <ResizableHandle withHandle className='h-4 my-auto' />
                <ResizablePanel defaultSize={60} minSize={50} className='mt-3 border border-border rounded-tl-xl'>
                    <Artifact artifactUrl={srcUrl} title="Note" />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};
