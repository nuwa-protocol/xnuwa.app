import { CapAvatar } from '@/shared/components/cap-avatar';
import type { Cap } from '@/shared/types';
import { SuggestedActions } from './suggested-actions';

interface CapInfoProps {
  cap: Cap;
}

// Clean, minimal info block using divs only; focus on layout & typography
export function CapInfo({ cap }: CapInfoProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-6" role="region" aria-label="Capability information">
      <div className="flex flex-col items-center text-center py-6">
        <CapAvatar
          capName={cap.metadata.displayName}
          capThumbnail={cap.metadata.thumbnail}
          size="4xl"
          className="rounded-xl mb-2"
        />

        <div className="mb-2 text-xl md:text-2xl font-semibold tracking-tight text-foreground">
          {cap.metadata.displayName}
        </div>

        <div className="mb-4 flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <div>{cap.core.model.modelId}</div>
          <div> • Context {Math.round(cap.core.model.contextLength / 1000)}k</div>
          {cap.core.artifact && ' • Artifact'}
          {Object.keys(cap.core.mcpServers).length > 0 && ` • ${Object.keys(cap.core.mcpServers).length} MCP`}
          {/* {tags.map((tag) => (
            <div key={tag} className="opacity-70">#{tag}</div>
          ))} */}
        </div>

        {cap.metadata.description && (
          <div className="mt-1 text-sm md:text-[15px] leading-6 text-muted-foreground/90">
            {cap.metadata.description}
          </div>
        )}
      </div>
      <div className="mt-2">
        <SuggestedActions />
      </div>
    </div>
  );
}
