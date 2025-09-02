import { CapStoreContent } from '@/features/cap-store/components/cap-store-content';
import { CapStoreHeader } from '@/features/cap-store/components/cap-store-header';
import { CapStoreModalProvider } from '@/features/cap-store/components/cap-store-modal-context';
import { CapStoreSidebar } from '@/features/cap-store/components/cap-store-sidebar';

export default function CapStorePage() {
  return (
    <CapStoreModalProvider>
      <div className="flex h-screen w-full">
        <CapStoreSidebar />
        <div className="flex flex-1 flex-col">
          <CapStoreHeader />
          <main className="flex-1 overflow-y-auto">
            <CapStoreContent />
          </main>
        </div>
      </div>
    </CapStoreModalProvider>
  );
}
