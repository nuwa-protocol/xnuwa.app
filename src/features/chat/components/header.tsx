import { BrushCleaning, MoreHorizontal, Trash } from 'lucide-react';
import { CapSelector } from '@/features/cap-store/components';
import { Title } from '@/shared/components/title';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ChatSessionsStore } from '../stores';

interface HeaderProps {
  chatId: string;
}

export default function Header({ chatId }: HeaderProps) {
  const { chatSessions, updateSession } = ChatSessionsStore();
  const session = chatSessions[chatId || ''] || null;

  const title = session?.title || 'New Chat';

  const handleRename = async (newTitle: string) => {
    if (chatId) {
      await updateSession(chatId, { title: newTitle });
    }
  };

  const handleClearConversation = async () => {
    // TODO: Clear conversation
  };

  const handleDeleteConversation = async () => {
    // TODO: Delete conversation
  };


  return (
    <header
      className="sticky top-0 z-10 grid grid-cols-3 items-center bg-background/10 px-3 pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/10"
    >
      {/* Left: Actions */}
      <div className="flex items-center gap-1.5">
        <CapSelector />
      </div>
      {/* Center: Status area (AI or Save) */}
      <div className='flex flex-row justify-center items-center w-full'>
        <div className='flex flex-row justify-center items-center gap-2'>
          <Title
            title={title}
            onCommit={handleRename}
            className="text-muted-foreground p-2 flex items-center gap-2 group cursor-pointer bg-transparent border-none hover:bg-sidebar-accent/50 rounded transition-colors"
          />
        </div>
      </div>
      {/* Right: Connection status only (AI indicator moved next to title) */}
      <div className="justify-self-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open Conversation Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleClearConversation}>
              <BrushCleaning className="h-4 w-4" />
              <span>Clear Context</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteConversation} className="font-medium text-destructive">
              <Trash className="h-4 w-4" />
              <span >Delete Chat</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
