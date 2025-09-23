import {
  MoreHorizontal,
  Pencil,
  PinIcon,
  PinOffIcon,
  Trash,
} from 'lucide-react';
import { useState } from 'react';
import type { ChatSession } from '@/features/chat/types';
import { RenameDialog } from '@/shared/components/rename-dialog';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useLanguage } from '@/shared/hooks/use-language';
import { DeleteChatDialog } from './delete-chat-dialog';

interface ChatDropdownMenuProps {
  session: ChatSession | null;
  onRename: (newTitle: string) => void;
  onTogglePin: () => void;
  onDelete: () => void;
  trigger?: React.ReactNode;
  onMenuOpenChange?: (open: boolean) => void;
}

export function ChatDropdownMenu({
  session,
  onRename,
  onTogglePin,
  onDelete,
  trigger,
  onMenuOpenChange,
}: ChatDropdownMenuProps) {
  const { t } = useLanguage();
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleRename = () => {
    setRenameDialogOpen(true);
    setMenuOpen(false);
  };

  const handleRenameConfirm = (newTitle: string) => {
    onRename(newTitle);
  };

  const handleTogglePin = () => {
    onTogglePin();
    setMenuOpen(false);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    setMenuOpen(false);
  };

  const handleDeleteConfirm = () => {
    onDelete();
  };

  const handleMenuOpenChange = (open: boolean) => {
    setMenuOpen(open);
    onMenuOpenChange?.(open);
  };

  const handleDialogOpenChange = (open: boolean) => {
    onMenuOpenChange?.(open);
  };

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="h-4 px-2 text-muted-foreground"
    >
      <MoreHorizontal className="h-2 w-4" />
      <span className="sr-only">Open Conversation Menu</span>
    </Button>
  );

  return (
    <>
      <DropdownMenu
        modal={true}
        open={menuOpen}
        onOpenChange={handleMenuOpenChange}
      >
        <DropdownMenuTrigger asChild>
          {trigger || defaultTrigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align={'start'}>
          <DropdownMenuItem onClick={handleRename}>
            <Pencil className="h-4 w-4" />
            <span>{t('actions.rename')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={handleTogglePin}
          >
            {session?.pinned ? <PinOffIcon /> : <PinIcon />}
            <span>
              {session?.pinned ? t('actions.unpin') : t('actions.pin')}
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className='cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500'
          >
            <Trash className="h-4 w-4" />
            <span>
              {t('actions.delete')}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={(open) => {
          setRenameDialogOpen(open);
          handleDialogOpenChange(open);
        }}
        currentName={session?.title || ''}
        onRename={handleRenameConfirm}
      />

      <DeleteChatDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          handleDialogOpenChange(open);
        }}
        chatTitle={session?.title || 'New Chat'}
        onDelete={handleDeleteConfirm}
      />
    </>
  );
}
