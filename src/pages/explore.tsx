import { useLocation, useSearchParams } from 'react-router-dom';
import { CapDetails } from '@/features/cap-store/components';
import { CapStoreCapsContent } from '@/features/cap-store/components/content-caps';
import { CapStoreInstalledContent } from '@/features/cap-store/components/content-installed';
import { CapStoreSidebar } from '@/features/cap-store/components/sidebar';

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
  } else if (path === 'installed') {
    return <CapStoreInstalledContent />;
  } else {
    return <CapStoreCapsContent tag={tag} sortBy={sortBy} search={search} />;
  }
};

export default function ExplorePage() {
  return (
    <div className="flex h-full">
      <CapStoreSidebar />
      <div className="flex-1 flex overflow-y-auto hide-scrollbar">
        <ExplorePageContent />
      </div>
    </div>
  );
}
