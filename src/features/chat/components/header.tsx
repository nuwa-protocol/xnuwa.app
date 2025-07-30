import { useLanguage } from '@/shared/hooks';
import { useChatSessions } from '../hooks/use-chat-sessions';

interface HeaderProps {
  chatId: string;
}

export default function Header({ chatId }: HeaderProps) {
  const { sessionsMap } = useChatSessions();
  const session = sessionsMap[chatId || ''] || null;
  const { t } = useLanguage();

  const title = session?.title || '';

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2 justify-between">
      <div className="text-muted-foreground p-2">{title}</div>
    </header>
  );
}
