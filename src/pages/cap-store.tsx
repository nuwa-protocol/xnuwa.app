import { CapStoreContent } from '@/features/cap-store/components/content';
import { CapStoreHeader } from '@/features/cap-store/components/header';
import { CapStoreProvider } from '@/features/cap-store/context';

export default function CapStorePage() {
  return (
    <CapStoreProvider>
      <CapStoreHeader />
      <div className="flex flex-col max-w-7xl mx-auto">
        <CapStoreContent />
      </div>
    </CapStoreProvider>
  );
}
