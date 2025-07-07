import { X } from 'lucide-react';
import { Avatar, AvatarImage, Button } from '@/shared/components/ui';
import { useCurrentCap } from '../hooks';

interface CurrentCapIndicatorProps {
  variant?: 'default' | 'icon';
}

export function CurrentCapIndicator({ variant = 'default' }: CurrentCapIndicatorProps) {
  const { currentCap, clearCurrentCap } = useCurrentCap();

  const handleCapClose = () => {
    clearCurrentCap();
  };

  if (!currentCap) return null;

  if (variant === 'icon') {
    return (
      <div className="group relative">
        <Avatar className="size-6 shrink-0">
          <AvatarImage
            src={`https://avatar.vercel.sh/${currentCap.name}`}
            alt={currentCap.name}
          />
        </Avatar>
        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {currentCap.name}
        </span>
      </div>
    );
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={handleCapClose}>
        <X className="size-2" />
      </Button>
      <Avatar className="size-6 shrink-0">
        <AvatarImage
          src={`https://avatar.vercel.sh/${currentCap.name}`}
          alt={currentCap.name}
        />
      </Avatar>
      {currentCap.name}
    </>
  );
}
