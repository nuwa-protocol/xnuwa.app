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
import { Slider } from '@/shared/components/ui/slider';
import { Switch } from '@/shared/components/ui/switch';
import { useLocale } from '@/shared/locales/use-locale';
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
  const { t } = useLocale();
  const { selectedModel, setSelectedModel } = useSelectedModel();
  const { favoriteModels, toggleFavorite, isFavorite } = useFavoriteModels();
  const [open, setOpen] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const { SetModelAuto } = useSelectAuto();
  const {
    webSearchEnabled,
    webSearchContextSize,
    setWebSearchEnabled,
    setWebSearchContextSize,
  } = useWebSearch();

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

  const handleWebSearchContextSizeChange = (value: number[]) => {
    setWebSearchContextSize(
      ['low', 'medium', 'high'][value[0]] as 'low' | 'medium' | 'high',
    );
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
                {t('aiProvider.modelSelector.selectModel')}
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
              <span className="text-sm font-medium truncate">
                {t('aiProvider.modelSelector.auto')}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {t('aiProvider.modelSelector.autoDescription')}
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
            <div className="flex flex-row flex-1 gap-2">
              <span className="text-sm font-medium">
                {t('aiProvider.modelSelector.webSearch')}
              </span>
            </div>

            <Switch
              checked={webSearchEnabled}
              onCheckedChange={setWebSearchEnabled}
              onClick={(e) => e.stopPropagation()}
            />
          </DropdownMenuItem>

          {webSearchEnabled && (
            <div className="w-full max-w-sm p-4">
              <Slider
                defaultValue={[
                  ['low', 'medium', 'high'].indexOf(webSearchContextSize),
                ]}
                max={2}
                step={1}
                onValueChange={handleWebSearchContextSizeChange}
              />
              <div className="mt-2 -mx-1.5 flex items-center justify-between text-muted-foreground text-xs">
                <span>{t('aiProvider.modelSelector.contextSize.low')}</span>
                <span>{t('aiProvider.modelSelector.contextSize.medium')}</span>
                <span>{t('aiProvider.modelSelector.contextSize.high')}</span>
              </div>
            </div>
          )}

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
                {favoriteModels.length > 0
                  ? t('aiProvider.modelSelector.moreModels')
                  : t('aiProvider.modelSelector.allModels')}
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
