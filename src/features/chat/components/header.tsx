import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { ChatSessionsStore } from '../stores';
import { ChatDropdownMenu } from './chat-dropdown-menu';

interface HeaderProps {
  chatId: string;
  showArtifact: boolean;
  setShowArtifact: (showArtifact: boolean) => void;
  hasArtifact: boolean;
}

export default function Header({
  chatId,
  showArtifact,
  setShowArtifact,
  hasArtifact,
}: HeaderProps) {
  const navigate = useNavigate();
  const { chatSessions, updateSession, deleteSession } = ChatSessionsStore();
  const session = chatSessions[chatId || ''] || null;
  const title = session?.title || 'New Chat';
  const centerTitle = showArtifact && hasArtifact;
  const titleSectionClassName = centerTitle
    ? 'flex flex-row items-center gap-2 flex-1 ml-4 min-w-0 justify-start'
    : 'flex flex-row items-center gap-2 flex-1 min-w-0 justify-center';
  const rightSectionClassName = centerTitle
    ? 'flex items-center ml-auto px-2'
    : 'flex flex-1 items-center justify-end px-2';

  const handleRename = async (newTitle: string) => {
    await updateSession(chatId, { title: newTitle });
  };

  const handleDeleteConversation = async () => {
    await deleteSession(chatId);
    navigate('/chat');
  };

  const handleTogglePin = () => {
    if (session) {
      updateSession(chatId, { pinned: !session.pinned });
    }
  };

  const handleToggleArtifact = () => {
    setShowArtifact(!showArtifact);
  };

  return (
    <header className="w-full sticky top-0 z-10 flex items-center px-3 pt-2">
      {!centerTitle && (
        <div className="flex min-w-0 flex-1 mr-4 gap-2 items-center">
          {/* Left: Actions */}
        </div>
      )}

      {/* Chat title */}
      <div className={titleSectionClassName}>
        {session && (
          <div className="flex flex-row items-center gap-2">
            <p className="text-center text-sm py-1 rounded-lg font-medium text-foreground/90 md:text-base line-clamp-1">
              {title}
            </p>
            <ChatDropdownMenu
              session={session}
              onRename={handleRename}
              onTogglePin={handleTogglePin}
              onDelete={handleDeleteConversation}
            />
          </div>
        )}
      </div>

      {/* Right: Artifact Panel Control */}
      <div className={rightSectionClassName}>
        {hasArtifact && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleToggleArtifact}
                  variant="ghost"
                  size="sm"
                  aria-label="Toggle artifact panel"
                >
                  {showArtifact ? (
                    <PanelRightClose className="size-6" />
                  ) : (
                    <PanelRightOpen className="size-6" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                align="end"
                className="rounded-lg border border-border/60 bg-background/95 px-2.5 py-1 text-xs text-muted-foreground shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80"
              >
                Artifact
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </header>
  );
}
