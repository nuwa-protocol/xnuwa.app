import type { LucideIcon } from 'lucide-react';
import { Monitor, User } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/shared/hooks/use-language';
import { AboutSection, GeneralSection, SystemSection } from './sections';
import { SettingsNav } from './settings-nav';

interface SettingsSection {
  id: string;
  icon: LucideIcon;
  name: string;
  description: string;
  component: React.ComponentType;
}

export function Settings() {
  const { t } = useLanguage();
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);

  // Settings sections
  const settingsSections: SettingsSection[] = [
    {
      id: 'about',
      icon: User,
      name:
        t('settings.sections.profile.title')?.replace('Profile', 'About') ||
        'About',
      description:
        t('settings.sections.profile.subtitle') || 'Your profile information.',
      component: AboutSection,
    },
    {
      id: 'general',
      icon: Monitor,
      name: t('settings.sections.general.title') || 'General',
      description:
        t('settings.sections.general.subtitle') ||
        'General application settings.',
      component: GeneralSection,
    },
    {
      id: 'system',
      icon: Monitor,
      name: t('settings.sections.system.title'),
      description: t('settings.sections.system.subtitle'),
      component: SystemSection,
    },
  ];

  const activeSection = settingsSections[activeSectionIndex];
  const ActiveSectionComponent = activeSection.component;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <SettingsNav
              settingsSections={settingsSections}
              setActiveSectionIndex={setActiveSectionIndex}
              activeSectionIndex={activeSectionIndex}
              variant="vertical"
            />
          </div>

          <div className="lg:col-span-3">
            <ActiveSectionComponent />
          </div>
        </div>
      </div>
    </div>
  );
}