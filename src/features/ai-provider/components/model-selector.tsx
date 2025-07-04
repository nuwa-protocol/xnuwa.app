import { CircleArrowOutUpRight, Globe, StarIcon } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Switch } from '@/shared/components/ui/switch';
import { cn } from '@/shared/utils';
import { useSelectedModel } from '../hooks';
import { useFavoriteModels } from '../hooks/use-favorite-models';
import { useSelectAuto } from '../hooks/use-select-auto';
import { useWebSearch } from '../hooks/use-web-search';
import type { Model } from '../types';
import { getModelName } from '../utils';
import { LLMModelSelector } from './model-selector-dialog';
import { ProviderAvatar } from './provider-avatar';

interface ModelSelectorProps {
  className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  className = '',
}) => {
  const { selectedModel, setSelectedModel } = useSelectedModel();
  const { favoriteModels, toggleFavorite, isFavorite } = useFavoriteModels();
  const [open, setOpen] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const { SetModelAuto } = useSelectAuto();
  const { webSearchEnabled, setWebSearchEnabled } = useWebSearch();

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
    setOpen(false);
  };

  const handleMoreClick = () => {
    setOpen(false);
    setModelSelectorOpen(true);
  };

  const handleDirectOpen = () => {
    setModelSelectorOpen(true);
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border bg-background hover:bg-accent transition-colors ${className}`}
            type="button"
            onClick={favoriteModels.length === 0 ? handleDirectOpen : undefined}
          >
            {selectedModel ? (
              <>
                <ProviderAvatar
                  provider={selectedModel.providerName}
                  size="sm"
                />
                <span className="truncate max-w-[120px] text-sm">
                  {getModelName(selectedModel)}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">
                Select Model
              </span>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64 max-h-80 overflow-y-auto hide-scrollbar"
          align="start"
        >
          {/* Auto option */}
          <DropdownMenuItem
            key="auto"
            className="flex items-center gap-2 py-2 px-3 cursor-pointer"
            onClick={SetModelAuto}
          >
            <ProviderAvatar provider="Auto" size="sm" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium truncate">Auto</span>
              <span className="text-xs text-muted-foreground truncate">
                Auto select the best model
              </span>
            </div>
            {selectedModel?.id === 'auto' && (
              <div className="w-2 h-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2 py-2 px-3 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              setWebSearchEnabled(!webSearchEnabled);
            }}
          >
            <Globe className="h-4 w-4" />
            <div className="flex flex-col flex-1">
              <span className="text-sm font-medium">Web Search</span>
            </div>
            <Switch
              checked={webSearchEnabled}
              onCheckedChange={setWebSearchEnabled}
              onClick={(e) => e.stopPropagation()}
            />
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          {favoriteModels.length > 0 && (
            <div>
              {favoriteModels.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  className="flex items-center gap-2 py-2 px-2 cursor-pointer"
                  onClick={() => handleModelSelect(model)}
                >
                  <ProviderAvatar provider={model.providerName} size="sm" />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {getModelName(model)}
                    </span>
                  </div>
                  {selectedModel?.id === model.id && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(model);
                    }}
                    className="h-8 w-8"
                  >
                    <StarIcon
                      className={cn(
                        'h-4 w-4',
                        isFavorite(model.id)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground',
                      )}
                    />
                  </Button>
                </DropdownMenuItem>
              ))}
            </div>
          )}

          <DropdownMenuItem
            className="flex items-center gap-2 py-2 px-3 cursor-pointer"
            onClick={handleMoreClick}
          >
            <CircleArrowOutUpRight />
            <div className="flex flex-row flex-1">
              <span className="text-sm">
                {favoriteModels.length > 0 ? 'More Models ' : 'All Models '}
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={modelSelectorOpen} onOpenChange={setModelSelectorOpen}>
        <DialogContent className="max-w-6xl h-[80vh] p-0 overflow-hidden">
          <LLMModelSelector onClose={() => setModelSelectorOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};
