import { Account } from '@/features/account/components';
import Loading from '@/shared/components/loading';
import { useAccountData } from '@/features/account/hooks/use-account-data';

export default function AccountPage() {
  const { isLoading, isAuthenticated } = useAccountData();

  if (!isAuthenticated || isLoading) {
    return <Loading />;
  }

  return <Account />;
}