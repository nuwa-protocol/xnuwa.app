import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CapSelector } from '@/features/cap-store/components';
import { Button } from '@/shared/components';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { ChatSessionsStore } from '../stores';
import { ChatDropdownMenu } from './chat-dropdown-menu';

interface HeaderProps {
  chatId: string;
  showArtifact: boolean;
  setShowArtifact: (showArtifact: boolean) => void;
}

export default function Header({
  chatId,
  showArtifact,
  setShowArtifact,
}: HeaderProps) {
  const navigate = useNavigate();
  const { currentCap } = CurrentCapStore();
  const hasArtifact = !!currentCap.core.artifact;
  const { chatSessions, updateSession, deleteSession } = ChatSessionsStore();
  const session = chatSessions[chatId || ''] || null;
  const title = session?.title || 'New Chat';

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
    <header className="w-full sticky top-0 z-10 grid grid-cols-3 items-center px-3 pt-2">
      {/* Left: Actions */}
      <div className="flex min-w-0 flex-1 mr-4">
        <CapSelector />
      </div>
      {/* Center: Status area (AI or Save) */}

      <div className="flex flex-row justify-center items-center w-full">
        {session && (
          <div className="flex flex-row justify-center items-center gap-2">
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

      {/* Right: Context and Cost Indicator */}
      <div className="justify-self-end px-2">
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
