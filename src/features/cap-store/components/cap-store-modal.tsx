import * as Dialog from '@/shared/components/ui';
import { useLanguage } from '@/shared/hooks';
import { CapStoreContent } from './cap-store-content';
import { CapStoreHeader } from './cap-store-header';
import { useCapStoreModal } from './cap-store-modal-context';
import { CapStoreSidebar } from './cap-store-sidebar';

export function CapStoreModal() {
  const { t } = useLanguage();

  const { toggleModal, isOpen } = useCapStoreModal();

  return (
    <Dialog.Dialog open={isOpen} onOpenChange={toggleModal}>
      <Dialog.DialogContent
        className="fixed left-1/2 top-1/2 z-50 flex flex-col -translate-x-1/2 -translate-y-1/2 gap-0 border bg-background p-0 shadow-lg sm:rounded-lg overflow-hidden [&>button:last-child]:hidden"
        style={{
          width: '90vw',
          maxWidth: 1200,
          height: '85vh',
          maxHeight: 800,
          minHeight: 0,
        }}
        aria-describedby={undefined}
      >
        <Dialog.DialogTitle className="sr-only">
          {t('capStore.title')}
        </Dialog.DialogTitle>

        {/* Main Content with Sidebar */}
        <div className="flex-1 min-h-0 flex">
          <CapStoreSidebar />

          {/* Content Area */}
          <div className="flex-1 min-h-0 flex flex-col">
            <CapStoreHeader />

            <div className="flex-1 min-h-0">
              <CapStoreContent />
            </div>
          </div>
        </div>
      </Dialog.DialogContent>
    </Dialog.Dialog>
  );
}
