import {
  BookOpen,
  Bot,
  Brain,
  Code,
  Coins,
  MoreHorizontal,
  Package,
  PenTool,
  Wrench,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { useLanguage } from '@/shared/hooks';
import {
  buildExplorerAddressUrlFromRegistry,
  getMarketplaceLinkFromRegistry,
  type IdentityRegistry,
  REGISTRIES,
} from '../../../erc8004/8004-registries';
import { getAgent8004ByPage } from '../../../erc8004/8004-service';
import type { CapStoreSection } from '../types';

export function CapStoreSidebar() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();

  // Include chain/network data from registries.
  const tagSections: IdentityRegistry[] = REGISTRIES;

  // Cache icons locally (address -> image URL or null if none found)
  const [icons, setIcons] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let mounted = true;
    const addrs = tagSections
      .map((s) => s.id as `0x${string}`)
      .filter((a) => icons[a] === undefined);
    if (!addrs.length) return;

    const fetchIcons = async () => {
      for (const address of addrs) {
        let url: string | null = null;
        try {
          // Try first N agents and pick the first with a valid image
          const agents = await getAgent8004ByPage(address, 0, 8);
          for (const agent of agents) {
            const img = (agent as any)?.image;
            if (typeof img === 'string' && /^https?:\/\//.test(img)) {
              url = img;
              break;
            }
          }
        } catch {
          // ignore errors; url stays null
        }
        if (!mounted) return;
        setIcons((prev) => ({ ...prev, [address]: url }));
      }
    };
    fetchIcons();
    return () => {
      mounted = false;
    };
    // serialize ids as dependency to re-run when registries change
  }, [JSON.stringify(tagSections.map((s) => s.id).sort())]);

  const getActiveSection = (): CapStoreSection => {
    const pathSegments = pathname.split('/');
    const path = pathSegments[2];

    if (path === 'installed') {
      return { id: 'installed', label: 'Installed Caps', type: 'section' };
    }

    return (
      tagSections.find((section) => section.id === path) || {
        id: 'all',
        label: 'All Caps',
        type: 'section',
      }
    );
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
        {/* <h2 className="text-lg font-semibold mb-4 mx-5">ERC8004 Registries</h2> */}

        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-1">
            {/* Installed */}
            {/* <Button
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
            </Button> */}

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
            {/* <div className="h-px bg-border" /> */}

            {/* Tags */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Registries
              </div>
              {tagSections.map((section) => {
                const IconComponent = getSectionIcon(section.id, section.type);
                const isSelected = activeSection.id === section.id;
                const explorerUrl = buildExplorerAddressUrlFromRegistry(
                  section,
                  section.id,
                );
                const marketplace = getMarketplaceLinkFromRegistry(
                  section,
                  section.id,
                );

                return (
                  <div key={section.id} className="relative group">
                    {/* Main registry button */}
                    <Button
                      variant={isSelected ? 'secondary' : 'ghost'}
                      className="w-full justify-start gap-3 h-10 pr-8"
                      onClick={() => handleActiveSectionChange(section)}
                    >
                      {icons[section.id] ? (
                        <img
                          alt="registry icon"
                          src={icons[section.id] as string}
                          className="size-4 rounded-sm object-cover"
                        />
                      ) : (
                        <IconComponent className="size-4" />
                      )}
                      <span>{section.label}</span>
                    </Button>

                    {/* Hover menu icon with dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          // Prevent navigating when clicking the menu icon
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="
                            absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-sm z-10
                            text-muted-foreground/60 hover:text-foreground hover:bg-accent
                            opacity-0 group-hover:opacity-100 transition-opacity
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                          "
                          aria-label="Open menu"
                        >
                          <MoreHorizontal className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {marketplace ? (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(marketplace.url, '_blank');
                            }}
                          >
                            {`see on ${marketplace.label.toLowerCase()}`}
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(explorerUrl, '_blank');
                          }}
                        >
                          see on explorer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
