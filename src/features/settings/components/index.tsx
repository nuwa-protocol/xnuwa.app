import type { LucideIcon } from 'lucide-react';
import { Monitor, User } from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAuthHandler } from '@/features/auth/hooks/use-auth-handler';
import { useSettings } from '@/features/settings/hooks/use-settings';
import { toast } from '@/shared/components';
import { useDevMode } from '@/shared/hooks';
import { useLanguage } from '@/shared/hooks/use-language';
import { useStorage } from '@/shared/hooks/use-storage';
import { LanguageSelector } from './language-selector';
import type { SettingCardProps } from './setting-card';
import { SettingSection } from './setting-section';
import { SettingsNav } from './settings-nav';
import { ThemeSelector } from './theme-selector';

interface SettingsSection {
  id: string;
  icon: LucideIcon;
  name: string;
  description: string;
  cardItems?: SettingCardProps[];
  customComponent?: React.ReactNode;
}

export function Settings() {
  const { t } = useLanguage();
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { clearAllStorage } = useStorage();
  const { settings, setSetting } = useSettings();
  const { did } = useAuth();
  const { logout } = useAuthHandler();
  const [tempName, setTempName] = useState(settings.name);
  const isDevMode = useDevMode();

  // Handlers for cards
  const handleDisplayNameChange = (value: string) => setTempName(value);
  const handleDisplayNameSave = () => setSetting('name', tempName);

  // Avatar/photo logic
  const handleAvatarButtonClick = () => fileInputRef.current?.click();
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setSetting('avatar', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveAvatar = () => {
    setSetting('avatar', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clear all storage logic
  const handleClearStorage = async () => {
    setIsClearing(true);
    try {
      await clearAllStorage();
      toast({
        type: 'success',
        description: t('settings.system.clearAllStorage.success'),
      });
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      toast({
        type: 'error',
        description: t('settings.system.clearAllStorage.error'),
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Logout logic
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast({
        type: 'success',
        description:
          t('settings.profile.logout.success') || 'Successfully logged out',
      });
      // The auth guard will handle the redirect to login page
    } catch (error) {
      console.error('Failed to logout:', error);
      toast({
        type: 'error',
        description: t('settings.profile.logout.error') || 'Failed to logout',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Settings sections
  const settingsSections: SettingsSection[] = [
    {
      id: 'general',
      icon: Monitor,
      name: t('settings.sections.general.title') || 'General',
      description:
        t('settings.sections.general.subtitle') ||
        'General application settings.',
      customComponent: (
        <div className="space-y-6">
          <div className="rounded-lg border p-4">
            <ThemeSelector />
          </div>
          <div className="rounded-lg border p-4">
            <LanguageSelector />
          </div>
        </div>
      ),
    },
    {
      id: 'about',
      icon: User,
      name:
        t('settings.sections.profile.title')?.replace('Profile', 'About') ||
        'About',
      description:
        t('settings.sections.profile.subtitle') || 'Your profile information.',
      cardItems: [
        {
          variant: 'info',
          title: t('settings.profile.didInformation.title'),
          description: t('settings.profile.didInformation.description'),
          info: did || '',
          copyLabel: t('settings.profile.didInformation.copy'),
          copiedLabel: t('settings.profile.didInformation.copied'),
        },
        ...(isDevMode
          ? ([
              {
                variant: 'single-input' as const,
                title: t('settings.profile.displayName.title'),
                description: t('settings.profile.displayName.description'),
                value: tempName,
                onChange: handleDisplayNameChange,
                placeholder: t('settings.profile.displayName.placeholder'),
                buttonLabel: t('settings.profile.displayName.save'),
                onButtonClick: handleDisplayNameSave,
                disabled: tempName === settings.name && settings.name !== '',
              },
              {
                variant: 'avatar' as const,
                title: t('settings.profile.photo.title'),
                description: t('settings.profile.photo.description'),
                avatarUrl: settings.avatar,
                onAvatarChange: handleAvatarChange,
                onRemoveAvatar: handleRemoveAvatar,
                onUploadClick: handleAvatarButtonClick,
                uploadLabel: t('settings.profile.photo.changePhoto'),
                removeLabel: t('settings.profile.photo.remove'),
                fileInputRef: fileInputRef as React.RefObject<HTMLInputElement>,
                fileTypesHint: t('settings.profile.photo.fileTypes'),
                fallbackUrl: did
                  ? `https://avatar.vercel.sh/${did}`
                  : undefined,
              },
            ] satisfies SettingCardProps[])
          : []),
        {
          variant: 'danger-action',
          title: t('settings.profile.logout.title') || 'Logout',
          description:
            t('settings.profile.logout.description') ||
            'Sign out of your account',
          buttonLabel: t('settings.profile.logout.button') || 'Logout',
          onClick: handleLogout,
          disabled: isLoggingOut,
          confirmationTitle:
            t('settings.profile.logout.confirmTitle') || 'Confirm Logout',
          confirmationDescription:
            t('settings.profile.logout.confirmDescription') ||
            'Are you sure you want to logout? You will need to sign in again to continue using the application.',
          confirmationButtonLabel:
            t('settings.profile.logout.confirmButton') || 'Logout',
          cancelButtonLabel: t('settings.profile.logout.cancel') || 'Cancel',
        },
      ],
    },
    {
      id: 'system',
      icon: Monitor,
      name: t('settings.sections.system.title'),
      description: t('settings.sections.system.subtitle'),
      cardItems: [
        {
          variant: 'switch',
          title: t('settings.system.devMode.title') || 'Developer Mode',
          description:
            t('settings.system.devMode.description') ||
            'Enable or disable developer mode.',
          checked: settings.devMode,
          onChange: (checked: boolean) => setSetting('devMode', checked),
          disabled: false,
        },
        {
          variant: 'danger-action',
          title: t('settings.system.clearAllStorage.title'),
          description: t('settings.system.clearAllStorage.description'),
          buttonLabel: t('settings.system.clearAllStorage.button'),
          onClick: handleClearStorage,
          disabled: isClearing,
          confirmationTitle: t('settings.system.clearAllStorage.confirmTitle'),
          confirmationDescription: t(
            'settings.system.clearAllStorage.confirmDescription',
          ),
          confirmationButtonLabel: t(
            'settings.system.clearAllStorage.confirmButton',
          ),
          cancelButtonLabel: t('settings.system.clearAllStorage.cancel'),
        },
      ],
    },
  ];

  const activeSection = settingsSections[activeSectionIndex];

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
            <SettingSection
              key={activeSection.id}
              title={activeSection.name}
              description={activeSection.description}
              settingCards={activeSection.cardItems}
              customComponent={activeSection.customComponent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
