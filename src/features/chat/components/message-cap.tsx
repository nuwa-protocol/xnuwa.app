import type { OnResponseDataMarkPart } from '@/features/chat/types/marks';
import { CapAvatar } from '@/shared/components/cap-avatar';
import { Badge } from '@/shared/components/ui';

// Renders the cap identity header for an assistant message on the first onResponse mark
export function MessageCap({ part }: { part: OnResponseDataMarkPart }) {
  const data = part.data;
  if (!data?.cap) return null;
  const cap = data.cap as any; // Cap | LocalCap
  const isLocalCap = cap && typeof cap === 'object' && 'capData' in cap;
  const capName = isLocalCap
    ? cap.capData?.metadata?.displayName
    : cap?.metadata?.displayName;

  if (!cap) return null;

  return (
    <div className="flex items-center gap-2 -mb-2 text-sm text-muted-foreground">
      <CapAvatar cap={cap} size="md" className="rounded-md" />
      <span className="font-medium">{capName}</span>
      {isLocalCap && (
        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
          Dev
        </Badge>
      )}
    </div>
  );
}
