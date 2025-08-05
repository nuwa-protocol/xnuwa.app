import { useLanguage } from '@/shared/hooks/use-language';
import { LanguageSelector } from '../language-selector';
import { ThemeSelector } from '../theme-selector';

export function GeneralSection() {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t('settings.sections.general.title') || 'General'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('settings.sections.general.subtitle') ||
            'General application settings.'}
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <ThemeSelector />
      </div>

      <div className="rounded-lg border p-4">
        <LanguageSelector />
      </div>
    </div>
  );
}