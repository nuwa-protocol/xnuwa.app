
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks/use-language';
import { SettingsStateStore } from '../stores';

export function LanguageSelector() {
  const { settings, setSetting } = SettingsStateStore();
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium">
          {t('settings.system.language.title') || 'Language'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t('settings.system.language.description') ||
            'Select your preferred language.'}
        </p>
      </div>
      <Tabs
        value={settings.language}
        onValueChange={(value) => setSetting('language', value as 'en' | 'cn')}
      >
        <TabsList className="h-8 bg-muted p-1 rounded-xl border border-muted-foreground/10">
          <TabsTrigger
            value="en"
            className="px-3 py-1.5 rounded-xl transition-colors data-[state=active]:!bg-background data-[state=active]:!text-foreground data-[state=active]:!border data-[state=active]:!border-muted-foreground/40 data-[state=active]:shadow-sm text-xs"
          >
            {t('language.english')}
          </TabsTrigger>
          <TabsTrigger
            value="cn"
            className="px-3 py-1.5 rounded-xl transition-colors data-[state=active]:!bg-background data-[state=active]:!text-foreground data-[state=active]:!border data-[state=active]:!border-muted-foreground/40 data-[state=active]:shadow-sm text-xs"
          >
            {t('language.chinese')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
