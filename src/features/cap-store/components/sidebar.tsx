import {
  BookOpen,
  Bot,
  Brain,
  Code,
  Coins,
  MoreHorizontal,
  Package,
  PenTool,
  Star,
  Wrench,
} from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { predefinedTags } from '@/shared/constants/cap';
import { useLanguage } from '@/shared/hooks';
import type { CapStoreSection } from '../types';

export function CapStoreSidebar() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();

  const tagSections: CapStoreSection[] = predefinedTags.map((tag) => ({
    id: tag.toLowerCase().replace(/\s+/g, '-'),
    label: tag,
    type: 'tag' as const,
  }));

  const getActiveSection = (): CapStoreSection => {
    const pathSegments = pathname.split('/');
    const path = pathSegments[2];
    const tag = searchParams.get('tag');

    if (path === 'installed') {
      return { id: 'installed', label: 'Installed Caps', type: 'section' };
    }

    if (path === 'caps' && tag) {
      const tagSection = tagSections.find(
        (section) => section.id === tag.toLowerCase().replace(/\s+/g, '-'),
      );
      if (tagSection) {
        return tagSection;
      }
    }

    if (path === 'caps') {
      return { id: 'all', label: 'All Caps', type: 'section' };
    }

    return { id: 'all', label: 'All Caps', type: 'section' };
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
      navigate('/explore/caps');
    } else if (section.type === 'tag') {
      navigate(`/explore/caps?tag=${section.label}`);
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
              className="w-full justify-start gap-3 h-10"
              onClick={() =>
                handleActiveSectionChange({
                  id: 'installed',
                  label: 'Installed Caps',
                  type: 'section',
                })
              }
            >
              <Package className="size-4" />
              <span>Installed Caps</span>
            </Button>

            {/* All Caps */}
            <Button
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
            </Button>

            {/* Separator */}
            <div className="my-4 h-px bg-border" />

            {/* Tags */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Categories
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
