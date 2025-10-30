import {
  BookOpen,
  Bot,
  Brain,
  Code,
  Coins,
  Download,
  MoreHorizontal,
  Package,
  PenTool,
  Wrench,
} from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useLanguage } from '@/shared/hooks';
import { REGISTRIES } from '../8004-registries';
import type { CapStoreSection } from '../types';

export function CapStoreSidebar() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();

  const tagSections: CapStoreSection[] = REGISTRIES;

  const getActiveSection = (): CapStoreSection => {
    const pathSegments = pathname.split('/');
    const path = pathSegments[2];

    if (path === 'installed') {
      return { id: 'installed', label: 'Installed Caps', type: 'section' };
    }

    return tagSections.find((section) => section.id === path) || { id: 'all', label: 'All Caps', type: 'section' };
  };

  const getSectionIcon = (sectionId: string, type: string) => {
    if (type === 'section') {
      switch (sectionId) {
        case 'installed':
          return Package;
        case 'all':
          return Bot;
        default:
          return Package;
      }
    }

    if (type === 'tag') {
      switch (sectionId) {
        case 'ai-model':
          return Brain;
        case 'coding':
          return Code;
        case 'content-writing':
          return PenTool;
        case 'research':
          return BookOpen;
        case 'crypto':
          return Coins;
        case 'tools':
          return Wrench;
        case 'others':
          return MoreHorizontal;
        default:
          return Package;
      }
    }

    return Package;
  };

  const handleActiveSectionChange = (section: CapStoreSection) => {
    if (section.id === 'installed') {
      navigate('/explore/installed');
    } else if (section.id === 'all') {
      navigate('/explore');
    } else if (section.type === 'tag') {
      navigate(`/explore/${section.id}`);
    }
  };

  const activeSection = getActiveSection();

  return (
    <div className="w-64 border-r border-border">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4 mx-5">AI Capabilities</h2>

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-1">
            {/* Installed */}
            <Button
              variant={activeSection.id === 'installed' ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-3 h-10 mb-2"
              onClick={() =>
                handleActiveSectionChange({
                  id: 'installed',
                  label: 'Installed Caps',
                  type: 'section',
                })
              }
            >
              <Download className="size-4" />
              <span>Installed Caps</span>
            </Button>

            {/* All Caps */}
            {/* <Button
              variant={activeSection.id === 'all' ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-3 h-10"
              onClick={() =>
                handleActiveSectionChange({
                  id: 'all',
                  label: 'All Caps',
                  type: 'section',
                })
              }
            >
              <Bot className="size-4" />
              <span>All Caps</span>
            </Button> */}

            {/* Separator */}
            <div className="h-px bg-border" />

            {/* Tags */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Registries
              </div>
              {tagSections.map((section) => {
                const IconComponent = getSectionIcon(section.id, section.type);
                const isSelected = activeSection.id === section.id;

                return (
                  <Button
                    key={section.id}
                    variant={isSelected ? 'secondary' : 'ghost'}
                    className="w-full justify-start gap-3 h-10"
                    onClick={() => handleActiveSectionChange(section)}
                  >
                    <IconComponent className="size-4" />
                    <span>{section.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
