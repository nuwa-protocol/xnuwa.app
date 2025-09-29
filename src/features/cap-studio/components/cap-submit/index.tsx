import { CapStudioStore } from '../../stores';
import { CapSubmitForm } from './cap-submit-form';

export function Submit({ id }: { id: string }) {
  const { localCaps } = CapStudioStore();

  const cap = localCaps.find((cap) => cap.id === id);

  if (!cap) {
    return (
      <div className="text-center w-full h-full py-12">
        <p className="text-muted-foreground">Cap not found</p>
      </div>
    );
  }

  return (
    <CapSubmitForm cap={cap} />
  );
}
