import { LogOut, Monitor, Moon, Settings, Sun } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthHandler } from '@/features/auth/hooks';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { SettingsModal } from '@/features/settings/components';
import { useSettings } from '@/features/settings/hooks/use-settings';
import { useTheme } from '@/shared/components/theme-provider';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tabs,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks/use-language';
import { useStorage } from '@/shared/hooks/use-storage';
import type { Locale } from '@/shared/locales';

export function AssistantNav() {
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();
  const { did } = useAuth();
  const { logout } = useAuthHandler();
  const { t } = useLanguage();
  const { settings, setSetting } = useSettings();
  const { resetAllStores } = useStorage();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = () => {
    resetAllStores();
    logout();
    navigate('/login');
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
            <Avatar>
              <AvatarImage
                src={`https://avatar.vercel.sh/${did}`}
                alt={'Assistant Avatar'}
              />
              <AvatarFallback> Assistant Nav </AvatarFallback>
            </Avatar>
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
              <Tabs
                value={theme}
                onValueChange={(value) =>
                  setTheme(value as 'light' | 'dark' | 'system')
                }
              >
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
