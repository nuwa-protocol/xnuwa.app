import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useAuthHandler } from '@/features/auth/hooks/use-auth-handler';
import { useLanguage } from '@/shared/hooks/use-language';
import { InfoCard, LogoutCard } from '../cards';

export function AboutSection() {
  const { t } = useLanguage();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { did } = useAuth();
  const { logout } = useAuthHandler();

  // Logout logic
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success(
        t('settings.profile.logout.success') || 'Successfully logged out',
      );
      // The auth guard will handle the redirect to login page
    } catch (error) {
      console.error('Failed to logout:', error);
      toast.error(t('settings.profile.logout.error') || 'Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t('settings.sections.profile.title')?.replace('Profile', 'About') ||
            'About'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('settings.sections.profile.subtitle') ||
            'Your profile information.'}
        </p>
      </div>

      <InfoCard
        title={t('settings.profile.didInformation.title')}
        description={t('settings.profile.didInformation.description')}
        info={did || ''}
        copyLabel={t('settings.profile.didInformation.copy')}
        copiedLabel={t('settings.profile.didInformation.copied')}
      />

      <LogoutCard
        title={t('settings.profile.logout.title') || 'Logout'}
        description={
          t('settings.profile.logout.description') || 'Sign out of your account'
        }
        buttonLabel={t('settings.profile.logout.button') || 'Logout'}
        onClick={handleLogout}
        disabled={isLoggingOut}
        confirmationTitle={
          t('settings.profile.logout.confirmTitle') || 'Confirm Logout'
        }
        confirmationDescription={
          t('settings.profile.logout.confirmDescription') ||
          'Are you sure you want to logout? You will need to sign in again to continue using the application.'
        }
        confirmationButtonLabel={
          t('settings.profile.logout.confirmButton') || 'Logout'
        }
        cancelButtonLabel={t('settings.profile.logout.cancel') || 'Cancel'}
      />
    </div>
  );
}
