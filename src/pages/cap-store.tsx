import { CapStoreContent } from '@/features/cap-store/components/content';
import { CapStoreHeader } from '@/features/cap-store/components/header';

export default function CapStorePage() {
  return (
    <>
      <CapStoreHeader />
      <div className="flex flex-col max-w-7xl mx-auto">
        <CapStoreContent />
      </div>
    </>
  );
}
