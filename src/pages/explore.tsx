import { useLocation, useSearchParams } from 'react-router-dom';
import { CapDetails } from '@/features/cap-store/components';
import { CapStoreCapsContent } from '@/features/cap-store/components/content-caps';
import { CapStoreFavoritesContent } from '@/features/cap-store/components/content-favorites';
import { CapStoreHomeContent } from '@/features/cap-store/components/content-home';
import { CapStoreHeader } from '@/features/cap-store/components/header';

const ExplorePageContent = () => {
  const { pathname } = useLocation();
  const path = pathname.split('/')[2];
  const capId = pathname.split('/')[3];
  const [searchParams] = useSearchParams();
  const tag = searchParams.get('tag');
  const sortBy = searchParams.get('sortBy');
  const search = searchParams.get('search');

  if (path === 'caps') {
    if (capId) {
      return <CapDetails capId={capId} />;
    } else {
      return <CapStoreCapsContent tag={tag} sortBy={sortBy} search={search} />;
    }
  } else if (path === 'favorites') {
    return <CapStoreFavoritesContent />;
  } else {
    return <CapStoreHomeContent />;
  }
};

export default function ExplorePage() {
  return (
    <>
      <CapStoreHeader />
      <div className="flex flex-col max-w-7xl mx-auto">
        <ExplorePageContent />
      </div>
    </>
  );
}
