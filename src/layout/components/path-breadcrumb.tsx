import { Folder, MessageSquare } from 'lucide-react';
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { useChatSessions } from '@/features/ai-chat/hooks/use-chat-sessions';
import { CurrentCapIndicator } from '@/features/cap/components/current-cap-indicator';
import { useCurrentCap } from '@/features/cap/hooks/use-current-cap';
import { useSidebarSettings } from '@/features/settings/hooks/use-settings-sidebar';
import { Logo } from '@/shared/components';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks/use-language';

export function PathBreadcrumb() {
  const location = useLocation();
  const router = useNavigate();
  const [searchParams] = useSearchParams();
  const { sessionsMap } = useChatSessions();
  const { t } = useLanguage();
  const { currentCap } = useCurrentCap();

  const pathSegments = location.pathname.split('/').filter(Boolean) || [];
  const isChat = pathSegments[0] === 'chat';
  const isFile = pathSegments[0] === 'file';

  const { mode } = useSidebarSettings();
  const isFloating = mode === 'floating';

  let breadcrumbContent = null;

  if (isChat) {
    const chatId = searchParams.get('cid');

    const session = sessionsMap[chatId || ''] || null;

    if (currentCap) {
      breadcrumbContent = (
        <>
          <BreadcrumbItem className="text-md font-medium text-foreground">
            <CurrentCapIndicator />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {session?.title || t('nav.sidebar.new')}
          </BreadcrumbItem>
        </>
      );
    } else {
      breadcrumbContent = (
        <>
          <BreadcrumbItem className="text-md font-medium text-foreground">
            <MessageSquare className="size-4" />
            {t('nav.sidebar.chat')}
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {session?.title || t('nav.sidebar.new')}
          </BreadcrumbItem>
        </>
      );
    }
  } else if (isFile) {
    breadcrumbContent = (
      <BreadcrumbItem className="text-md font-medium text-foreground">
        <Folder className="size-4" />
      </BreadcrumbItem>
    );
  }

  return (
    <Breadcrumb className="ml-4">
      <BreadcrumbList>
        {isFloating && (
          <BreadcrumbItem className="text-foreground">
            <Link to="/">
              <Logo />
            </Link>
          </BreadcrumbItem>
        )}
        {isChat || isFile ? breadcrumbContent : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
