import { useChat } from '@ai-sdk/react';
import { Maximize2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { CapUIRenderer } from '@/shared/components/cap-ui-renderer';
import { Button } from '@/shared/components/ui/button';
import { useChatContext } from '../../chat/contexts/chat-context';
import { ChatSessionsStore } from '../../chat/stores/chat-sessions-store';

type ArtifactProps = {
    artifactUrl: string;
    title?: string;
    onClose?: () => void;
    onEnlarge?: () => void;
    onTitleChange?: (next: string) => void;
};

export const Artifact = ({
    artifactUrl,
    title = 'Untitled Artifact',
    onClose,
    onEnlarge,
    onTitleChange,
}: ArtifactProps) => {
    const { addSelectionToChatSession } = ChatSessionsStore();
    const { chat } = useChatContext();
    const { sendMessage } = useChat({ chat });

    const [localTitle, setLocalTitle] = useState<string>(title);
    const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
    const [snapshotTitle, setSnapshotTitle] = useState<string>(title);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // Keep local title in sync when external title changes and not editing
        if (!isEditingTitle) setLocalTitle(title);
    }, [title, isEditingTitle]);

    useEffect(() => {
        if (isEditingTitle && inputRef.current) {
            const el = inputRef.current;
            el.focus();
            el.setSelectionRange(el.value.length, el.value.length);
        }
    }, [isEditingTitle]);

    const handleSendPrompt = (prompt: string) => {
        sendMessage({ text: prompt });
    };

    const handleAddSelection = (label: string, message: string) => {
        addSelectionToChatSession(chat.id, { label, message });
    };

    const handleClose = () => {
        if (onClose) return onClose();
        // Fallback: if browsing history exists, go back; otherwise no-op
        if (typeof window !== 'undefined' && window.history.length > 1) {
            window.history.back();
        }
    };

    const handleEnlarge = () => {
        if (onEnlarge) return onEnlarge();
        if (typeof window !== 'undefined') {
            window.open(artifactUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 grid grid-cols-3 items-center border-b border-border bg-background/60 px-3 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                {/* Left: Actions */}
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-md hover:bg-muted"
                        onClick={handleEnlarge}
                        aria-label="Enlarge"
                        title="Enlarge"
                    >
                        <Maximize2 className="h-4 w-4" />
                    </Button>
                </div>
                {/* Center: Title (editable) */}
                <div className="justify-self-center min-w-0 max-w-[min(70vw,700px)]">
                    {isEditingTitle ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={localTitle}
                            onChange={(e) => setLocalTitle(e.target.value)}
                            onBlur={() => {
                                const next = localTitle.trim() || 'Untitled Artifact';
                                setLocalTitle(next);
                                setIsEditingTitle(false);
                                if (next !== snapshotTitle) onTitleChange?.(next);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                } else if (e.key === 'Escape') {
                                    setLocalTitle(snapshotTitle);
                                    setIsEditingTitle(false);
                                }
                            }}
                            placeholder="Untitled Artifact"
                            title="Enter to save · Esc to cancel"
                            className="h-8 w-full rounded-md border border-border bg-background px-2 text-center text-sm font-medium text-foreground/90 shadow-sm outline-none transition-colors duration-150 md:text-base focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary/50"
                            aria-label="Edit title"
                        />
                    ) : (
                        <button
                            type="button"
                            className="w-full cursor-text truncate text-center text-sm font-medium text-foreground/90 hover:text-foreground md:text-base"
                            onClick={() => {
                                setSnapshotTitle(localTitle);
                                setIsEditingTitle(true);
                            }}
                            title="Click to edit title"
                            aria-label="Title. Click to edit."
                        >
                            {localTitle || 'Untitled Artifact'}
                        </button>
                    )}
                </div>
                {/* Right: Placeholder to balance center */}
                <div className="justify-self-end">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-md hover:bg-destructive/10"
                        onClick={handleClose}
                        aria-label="Close"
                        title="Close"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
                <CapUIRenderer
                    srcUrl={artifactUrl}
                    title={localTitle || 'Untitled Artifact'}
                    artifact={true}
                    onSendPrompt={handleSendPrompt}
                    onAddSelection={handleAddSelection}
                    onSaveState={() => { }}
                    onGetState={() => { }}
                />
            </div>
        </div>
    );
};
