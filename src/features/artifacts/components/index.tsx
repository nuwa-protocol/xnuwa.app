import { useEffect } from 'react';
import { ChatContent } from '@/features/chat/components/chat-content';
import { useSidebarStore } from '@/features/sidebar/stores';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/shared/components/ui/resizable';
import { Artifact } from './artifact';

export const ArtifactMain = () => {
    const { setMode } = useSidebarStore();
    const srcUrl = 'http://localhost:3000/note';
    const handleTitleChange = (next: string) => {
        // Mock handler: log the new title for now
        // eslint-disable-next-line no-console
        console.log('Artifact title changed to:', next);
    };

    useEffect(() => {
        setMode('floating');
    }, []);

    return (
        <div className="flex w-full h-full">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={30} minSize={20}>
                    <ChatContent isReadonly={false} />
                </ResizablePanel>
                <ResizableHandle withHandle className='h-4 my-auto' />
                <ResizablePanel defaultSize={70} minSize={50} className='mr-2 my-3 border border-border rounded-xl'>
                    <Artifact artifactUrl={srcUrl} title="Note" onTitleChange={handleTitleChange} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
};
