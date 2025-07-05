import { PlusIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatSession } from '@/features/ai-chat/hooks/use-chat-session';
import { Button } from '@/shared/components/ui/button';
import { generateUUID } from '@/shared/utils';

export function ArtifactMessagesHeader({ chatId }: { chatId: string }) {
  const navigate = useNavigate();

  const { session } = useChatSession(chatId);

  const handleNewChat = () => {
    const chatId = generateUUID();
    navigate(`/artifact?cid=${chatId}`);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted dark:bg-background shadow-sm">
      <div className="font-semibold text-md">
        {session ? session.title : 'New Chat'}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleNewChat}
        aria-label="New Chat Button"
      >
        <PlusIcon className="size-5" />
      </Button>
    </div>
  );
}
