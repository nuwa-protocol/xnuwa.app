import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
} from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks/use-language';

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  onRename: (newName: string) => void;
}

export function RenameDialog({
  open,
  onOpenChange,
  currentName,
  onRename,
}: RenameDialogProps) {
  const { t } = useLanguage();
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (open) {
      setName(currentName);
    }
  }, [open, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== currentName) {
      onRename(trimmedName);
    }
    onOpenChange(false);
  };

  const handleCancel = () => {
    setName(currentName);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('dialog.renameChat.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('dialog.renameChat.placeholder')}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  handleCancel();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t('actions.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || name.trim() === currentName}
            >
              {t('actions.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
