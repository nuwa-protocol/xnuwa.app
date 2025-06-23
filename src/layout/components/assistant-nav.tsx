'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { SettingsModal } from '@/components/settings-modal';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

import type { Locale } from '@/locales';
import { useAuth } from '@/hooks/use-auth';
import { useStorage } from '@/hooks/use-storage';
import { useSettings } from '@/hooks/use-settings';
import { useLanguage } from '@/hooks/use-language';

export function AssistantNav() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { did } = useAuth();
  const { t } = useLanguage();
  const { settings, setSetting } = useSettings();
  const { resetAllStores } = useStorage();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    resetAllStores();
    router.push('/login');
  };

  if (!did) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-testid="assistant-nav-button"
            className="flex items-center rounded-full bg-background p-2 hover:shadow hover:bg-accent hover:text-accent-foreground focus:outline-none hover:cursor-pointer"
          >
            <Image
              src={`https://avatar.vercel.sh/${did}`}
              alt={'Assistant Avatar'}
              width={36}
              height={36}
              className="rounded-full"
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          data-testid="assistant-nav-menu"
          side="bottom"
          align="end"
          className="min-w-[260px] p-0"
        >
          {/* Menu Items */}
          <DropdownMenuItem
            className="text-sm px-4 py-2 cursor-pointer items-center"
            onClick={() => setSettingsOpen(true)}
          >
            <span className="flex items-center gap-2">
              <Settings size={16} />
              {t('settings.title')}
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Preferences Section */}
          <div className="px-4 py-2 text-sm">
            <div className="text-xs font-semibold text-muted-foreground mb-1">
              {t('nav.menu.preferences')}
            </div>
            <div className="flex items-center justify-between mb-2">
              <span>{t('nav.menu.theme')}</span>
              <Tabs value={theme} onValueChange={setTheme}>
                <TabsList className="h-8 bg-muted p-1 rounded-xl border border-muted-foreground/10">
                  <TabsTrigger
                    value="system"
                    className="px-2 py-1.5 rounded-xl transition-colors data-[state=active]:!bg-background data-[state=active]:!text-foreground data-[state=active]:!border data-[state=active]:!border-muted-foreground/40 data-[state=active]:shadow-sm"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Monitor size={16} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{t('nav.menu.system')}</TooltipContent>
                    </Tooltip>
                  </TabsTrigger>
                  <TabsTrigger
                    value="light"
                    className="px-2 py-1.5 rounded-xl transition-colors data-[state=active]:!bg-background data-[state=active]:!text-foreground data-[state=active]:!border data-[state=active]:!border-muted-foreground/40 data-[state=active]:shadow-sm"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Sun size={16} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{t('nav.menu.light')}</TooltipContent>
                    </Tooltip>
                  </TabsTrigger>
                  <TabsTrigger
                    value="dark"
                    className="px-2 py-1.5 rounded-xl transition-colors data-[state=active]:!bg-background data-[state=active]:!text-foreground data-[state=active]:!border data-[state=active]:!border-muted-foreground/40 data-[state=active]:shadow-sm"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Moon size={16} />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{t('nav.menu.dark')}</TooltipContent>
                    </Tooltip>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('nav.menu.language')}</span>
              <select
                className="border rounded px-2 py-1 text-xs bg-background"
                value={settings.language}
                onChange={(e) =>
                  setSetting('language', e.target.value as Locale)
                }
              >
                <option value="en">{t('language.english')}</option>
                <option value="cn">{t('language.chinese')}</option>
              </select>
            </div>
          </div>
          <DropdownMenuSeparator />
          {/* Sign Out */}
          <DropdownMenuItem
            asChild
            data-testid="assistant-nav-item-auth"
            className="px-4 py-2 gap-2 cursor-pointer text-destructive"
          >
            <button
              type="button"
              className="w-full text-left flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              {t('nav.profile.signOut')}
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
