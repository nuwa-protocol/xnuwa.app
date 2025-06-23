import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Logo } from './logo';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Folder, MessageSquare } from 'lucide-react';
import { useChatSessions } from '@/hooks/use-chat-sessions';
import { useSidebarSettings } from '@/hooks/use-settings-sidebar';
import type { ReactNode } from 'react';
import { useLanguage } from '@/hooks/use-language';

function NavDropdown({
  icon,
  label,
  t,
  router,
}: { icon: ReactNode; label: string; t: any; router: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="capitalize flex items-center gap-2">
        {icon}
        {label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          onClick={() => router.push('/chat')}
          className="flex items-center gap-2"
        >
          <MessageSquare className="size-4" />
          {t('nav.sidebar.chat')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push('/artifact')}
          className="flex items-center gap-2"
        >
          <Folder className="size-4" />
          {t('nav.sidebar.artifact')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PathBreadcrumb() {
  const path = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sessionsMap } = useChatSessions();
  const { t } = useLanguage();

  const pathSegments = path?.split('/').filter(Boolean) || [];
  const isChat = pathSegments[0] === 'chat';
  const isFile = pathSegments[0] === 'file';

  const { mode } = useSidebarSettings();
  const isFloating = mode === 'floating';

  let breadcrumbContent = null;

  if (isChat) {
    const chatId = searchParams.get('cid');

    const session = sessionsMap[chatId || ''] || null;

    breadcrumbContent = (
      <>
        <BreadcrumbItem className="text-md font-medium text-foreground">
          <NavDropdown
            icon={<MessageSquare className="size-4" />}
            label={t('nav.sidebar.chat')}
            t={t}
            router={router}
          />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {session?.title || t('nav.sidebar.new')}
        </BreadcrumbItem>
      </>
    );
  } else if (isFile) {
    breadcrumbContent = (
      <BreadcrumbItem className="text-md font-medium text-foreground">
        <NavDropdown
          icon={<Folder className="size-4" />}
          label={t('nav.sidebar.artifact')}
          t={t}
          router={router}
        />
      </BreadcrumbItem>
    );
  }

  return (
    <Breadcrumb className="ml-4">
      <BreadcrumbList>
        {isFloating && (
          <BreadcrumbItem className="text-foreground">
            <Link href="/">
              <Logo />
            </Link>
          </BreadcrumbItem>
        )}
        {isChat || isFile ? breadcrumbContent : null}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
