import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/shared/components/theme-provider';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks/use-language';

export function ThemeSelector() {
  const { setTheme, theme } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium">{t('nav.menu.theme')}</h3>
        <p className="text-sm text-muted-foreground">
          Choose your preferred theme
        </p>
      </div>
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
  );
}
