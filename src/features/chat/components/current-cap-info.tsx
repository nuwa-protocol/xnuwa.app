import { Package, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CapAvatar } from '@/shared/components/cap-avatar';
import { Button } from '@/shared/components/ui/button';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { InstalledCapsStore } from '@/shared/stores/installed-caps-store';
import { SuggestedActions } from './suggested-actions';

// Format large token counts into a compact string like "128k" or "2m".
// We don't need exact precision here; whole-number rounding is fine.
function formatContextLength(n?: number): string {
  if (!n || n <= 0) return '';
  return n >= 1_000_000
    ? `${Math.round(n / 1_000_000)}M`
    : `${Math.round(n / 1_000)}K`;
}

// Clean, minimal info block using divs only; focus on layout & typography
export function CurrentCapInfo() {
  const { getCurrentCap, setCurrentCap } = CurrentCapStore();
  const currentCap = getCurrentCap();
  const { installedCaps } = InstalledCapsStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentCap && installedCaps.length > 0) {
      setCurrentCap(installedCaps[0]);
    }
  }, [currentCap]);

  if (!currentCap) {
    return (
      <div
        className="w-full max-w-4xl mx-auto px-4 md:px-6"
        role="region"
        aria-label="Capability information"
      >
        <div className="flex flex-col items-center text-center py-8">
          <Package className="size-12 text-muted-foreground mb-3" />
          <div className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">
            Install Your First Cap
          </div>
          <div className="mt-2 text-sm md:text-[15px] leading-6 text-muted-foreground/90">
            Nuwa AI requires AI Capabilities to work. Please install a Cap to get started.
          </div>
          <div className="mt-4">
            <Button variant="default" onClick={() => navigate('/explore')}>
              <Sparkles className="w-4 h-4 mr-2" /> Explore Caps
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-4xl mx-auto px-4 md:px-6"
      role="region"
      aria-label="Capability information"
    >
      <div className="flex flex-col items-center text-center py-6">
        <CapAvatar cap={currentCap} size="4xl" className="rounded-xl mb-2" />

        <div className="mb-2 text-xl md:text-2xl font-semibold tracking-tight text-foreground">
          {currentCap?.metadata.displayName || ''}
        </div>

        <div className="mb-4 flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <div>{currentCap?.core.model.modelId || ''}</div>
          <div>{`• ${formatContextLength(currentCap?.core.model.contextLength)} Context`}</div>
          {currentCap?.core.artifact && ' • Artifact'}
          {Object.keys(currentCap?.core.mcpServers || {}).length > 0 &&
            ` • ${Object.keys(currentCap?.core.mcpServers || {}).length} MCP`}
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
