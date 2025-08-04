import { Bot } from 'lucide-react';
import { useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
} from '@/shared/components/ui';
import { useCurrentCap } from '@/shared/hooks';
import { CapStoreModal } from './cap-store-modal';

export function CapSelector() {
  const { currentCap } = useCurrentCap();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={(event) => {
          event.preventDefault();
          setIsModalOpen(true);
        }}
        className="rounded-xl"
        type="button"
      >
        <div className="flex items-center gap-2">
          {currentCap ? (
            <>
              <Avatar className="size-5">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${currentCap.metadata.displayName}`}
                  alt={currentCap.metadata.displayName}
                />
                <AvatarFallback className="text-xs">
                  {currentCap.metadata.displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-normal">
                {currentCap.metadata.displayName}
              </span>
            </>
          ) : (
            <>
              <Bot className="w-4 h-4" />
              <span className="text-sm">Select Cap</span>
            </>
          )}
        </div>
      </Button>

      <CapStoreModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
