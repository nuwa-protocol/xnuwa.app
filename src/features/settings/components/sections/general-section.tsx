import { useAuth } from '@/shared/hooks/use-auth';
import { useLanguage } from '@/shared/hooks/use-language';
import { InfoCard } from '../cards';
import { LanguageSelector } from '../language-selector';
import { ThemeSelector } from '../theme-selector';

export function GeneralSection() {
  const { t } = useLanguage();
  const { did } = useAuth();

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

      <InfoCard
        title={t('settings.profile.didInformation.title')}
        description={t('settings.profile.didInformation.description')}
        info={did || ''}
        copyLabel={t('settings.profile.didInformation.copy')}
        copiedLabel={t('settings.profile.didInformation.copied')}
      />

      <div className="rounded-lg border p-4">
        <ThemeSelector />
      </div>

      <div className="rounded-lg border p-4">
        <LanguageSelector />
      </div>
    </div>
  );
}
