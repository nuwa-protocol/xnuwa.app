import { Package, Sparkles } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CapAvatar } from '@/shared/components/cap-avatar';
import { Button } from '@/shared/components/ui/button';
import { CurrentCapStore } from '@/shared/stores/current-cap-store';
import { InstalledCapsStore } from '@/shared/stores/installed-caps-store';
import { SuggestedActions } from './suggested-actions';
import { getRegistryByAddress } from '@/erc8004/8004-registries';

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
            Install Your First AI Agent
          </div>
          <div className="mt-2 text-sm md:text-[15px] leading-6 text-muted-foreground/90">
            xNUWA requires installing AI Agents to work. Please install an AI Agent to get started.
          </div>
          <div className="mt-4">
            <Button variant="default" onClick={() => navigate('/explore')}>
              <Sparkles className="w-4 h-4 mr-2" /> Explore Agents
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
      <div className="flex flex-col items-center text-center py-4">
        {/* 头像和标题 */}
        <button
          type="button"
          onClick={() => {
            navigate(`/explore/${currentCap?.id}`);
          }}
          className="flex flex-col items-center"
        >
          <CapAvatar cap={currentCap} size="5xl" className="rounded-xl mb-2 mx-auto" />
          <div className="mb-2 text-xl md:text-2xl font-semibold tracking-tight text-foreground">
            {currentCap?.metadata.displayName || ''}
          </div>
        </button>
        <div className="flex flex-row justify-center items-center gap-2 mb-1 mt-0 w-full">
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-muted-foreground flex-grow">
            <div>{currentCap?.core.model.modelId || ''}</div>
            <div>{`• ${formatContextLength(currentCap?.core.model.contextLength)} Context`}</div>
            {currentCap?.core.artifact && ' • Artifact'}
            {Object.keys(currentCap?.core.mcpServers || {}).length > 0 &&
              ` • ${Object.keys(currentCap?.core.mcpServers || {}).length} MCP`}
            <div className="flex flex-row gap-2 flex-shrink-0">
              {(() => {
                const id = currentCap?.id || '';
                const [addr, tokenId] = id.split('/');
                const reg = addr ? getRegistryByAddress(addr) : undefined;
                const chainId = reg?.chainId;
                const url = (() => {
                  if (addr && tokenId) {
                    if (chainId === 11155111) {
                      return `https://testnet.rarible.com/token/${addr}:${tokenId}`;
                    }
                    return `https://opensea.io/assets/ethereum/${addr}/${tokenId}`;
                  }
                  return undefined;
                })();
                return url ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs rounded-md"
                    onClick={() => window.open(url, '_blank')}
                  >
                    {chainId === 11155111 ? 'Rarible' : 'OpenSea'}
                  </Button>
                ) : null;
              })()}
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-xs rounded-md"
                onClick={() => window.open(`https://etherscan.io/address/${currentCap?.id.split('/')[0]}`, '_blank')}
              >
                Etherscan
              </Button>
            </div>
          </div>

        </div>
        {currentCap?.metadata.description && (
          <div className="mt-0.5 text-sm md:text-[15px] leading-6 text-muted-foreground/90">
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
