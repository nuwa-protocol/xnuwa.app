import { CapAvatar } from '@/shared/components/cap-avatar';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { SuggestedActions } from './suggested-actions';

// Clean, minimal info block using divs only; focus on layout & typography
export function CurrentCapInfo() {
  const { getCurrentCap } = CurrentCapStore();
  const currentCap = getCurrentCap();
  const isCurrentLocal = currentCap && 'capData' in currentCap;

  return (
    <div
      className="w-full max-w-4xl mx-auto px-4 md:px-6"
      role="region"
      aria-label="Capability information"
    >
      <div className="flex flex-col items-center text-center py-6">
        <CapAvatar
          capName={currentCap?.metadata.displayName || ''}
          capThumbnail={currentCap?.metadata.thumbnail || ''}
          size="4xl"
          className="rounded-xl mb-2"
        />

        <div className="mb-2 text-xl md:text-2xl font-semibold tracking-tight text-foreground">
          {currentCap?.metadata.displayName || ''}
        </div>

        <div className="mb-4 flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <div>{currentCap?.core.model.modelId || ''}</div>
          <div>
            {' '}
            • Context {Math.round(currentCap?.core.model.contextLength || 0 / 1000)}k
          </div>
          {currentCap?.core.artifact && ' • Artifact'}
          {Object.keys(currentCap?.core.mcpServers || {}).length > 0 &&
            ` • ${Object.keys(currentCap?.core.mcpServers || {}).length} MCP`}
          {/* {tags.map((tag) => (
            <div key={tag} className="opacity-70">#{tag}</div>
          ))} */}
        </div>

        {currentCap?.metadata.description && (
          <div className="mt-1 text-sm md:text-[15px] leading-6 text-muted-foreground/90">
            {currentCap?.metadata.description}
          </div>
        )}
      </div>
      <div className="mt-2">
        <SuggestedActions />
      </div>
    </div>
  );
}
