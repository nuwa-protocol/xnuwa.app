import type { LucideIcon } from 'lucide-react';
import { Monitor, SettingsIcon, User } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/components/ui/tabs';
import { useLanguage } from '@/shared/hooks/use-language';
import { AboutSection, GeneralSection, SystemSection } from './sections';

interface SettingsSection {
  id: string;
  icon: LucideIcon;
  name: string;
  description: string;
  component: React.ComponentType;
}

export function Settings() {
  const { t } = useLanguage();

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
      icon: SettingsIcon,
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

  return (
    <div className="h-full">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="about" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="flex items-center gap-2"
                >
                  <Icon className="size-4" />
                  {section.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {settingsSections.map((section) => {
            const SectionComponent = section.component;
            return (
              <TabsContent key={section.id} value={section.id}>
                <SectionComponent />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
