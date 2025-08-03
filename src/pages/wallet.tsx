import { Wallet } from '@/features/wallet/components';
import { useAccountData } from '@/features/wallet/hooks/use-account-data';
import Loading from '@/shared/components/loading';

export default function WalletPage() {
  const { isLoading, isAuthenticated } = useAccountData();

  if (!isAuthenticated || isLoading) {
    return <Loading />;
  }

  return <Wallet />;
}
