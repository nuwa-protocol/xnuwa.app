import React, { useState, useMemo } from 'react';
import { useAvailableModels, useSelectedModel } from '../hooks';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
import { ModelAvatar } from './model-avatar';
import type { OpenRouterModel } from '../types';

const PROVIDER_TABS = [
  'All',
  'OpenAI',
  'Anthropic',
  'Google',
  'Meta',
  'Free',
  'Others',
];

function isFreeModel(model: OpenRouterModel): boolean {
  const { pricing } = model;
  if (!pricing) return false;
  return [
    pricing.prompt,
    pricing.completion,
    pricing.image,
    pricing.request,
    pricing.web_search,
    pricing.internal_reasoning,
  ].every((v) => v === '0');
}

function getProviderName(model: OpenRouterModel): string {
  const match = model.name.match(/^(.*?):/);
  return match ? match[1].trim() : 'Others';
}

function getModelName(model: OpenRouterModel): string {
  const match = model.name.match(/^.*?:\s*(.*)$/);
  return match ? match[1].trim() : model.name;
}

export const ModelSelector: React.FC = () => {
  const { models, loading, error } = useAvailableModels();
  const { selectedModel, setSelectedModel } = useSelectedModel();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');

  // Find the current selected OpenRouterModel based on selectedModel.id
  const currentModel = useMemo(() => {
    if (!selectedModel || !models) return null;
    return models.find(m => m.id === selectedModel.id) || null;
  }, [selectedModel, models]);

  // Group models by provider, with Free logic
  const groupedModels = useMemo(() => {
    if (!models) return {};
    const groups: Record<string, OpenRouterModel[]> = {
      All: [...models],
      OpenAI: [],
      Anthropic: [],
      Google: [],
      Meta: [],
      Free: [],
      Others: [],
    };
    for (const model of models) {
      if (isFreeModel(model)) {
        groups['Free'].push(model);
        continue;
      }
      const provider = getProviderName(model);
      if (PROVIDER_TABS.includes(provider) && provider !== 'Free' && provider !== 'All') {
        groups[provider].push(model);
      } else if (provider !== 'All') {
        groups['Others'].push(model);
      }
    }
    return groups;
  }, [models]);

  // Filtered models for each tab
  const filteredModels = useMemo(() => {
    if (!models) return {};
    const s = search.toLowerCase();
    const filtered: Record<string, OpenRouterModel[]> = {};
    for (const provider of PROVIDER_TABS) {
      filtered[provider] = (groupedModels[provider] || []).filter(
        (m) =>
          getModelName(m).toLowerCase().includes(s) ||
          getProviderName(m).toLowerCase().includes(s) ||
          m.id.toLowerCase().includes(s)
      );
    }
    return filtered;
  }, [groupedModels, search]);

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (error) {
    return <div className="text-red-500">Failed to load models</div>;
  }

  if (!models || models.length === 0) {
    return <div className="text-gray-500">No models available</div>;
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-background hover:bg-accent transition-colors"
          type="button"
        >
          {selectedModel && currentModel ? (
            <>
              <ModelAvatar model={currentModel} size="sm" />
              <span className="truncate max-w-[100px] text-sm">
                {getModelName(selectedModel)}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground text-sm">Select Model</span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select a Model</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search models..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="mb-4"
        />
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4 w-full grid grid-cols-7 h-auto">
            {PROVIDER_TABS.map((provider) => (
              <TabsTrigger 
                key={provider} 
                value={provider}
                className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {provider}
              </TabsTrigger>
            ))}
          </TabsList>
          {PROVIDER_TABS.map((provider) => (
            <TabsContent key={provider} value={provider}>
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {filteredModels[provider] && filteredModels[provider].length === 0 && (
                  <div className="text-center text-muted-foreground py-8">No models found</div>
                )}
                {filteredModels[provider] && filteredModels[provider].map((model) => (
                  <button
                    key={model.id}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-accent transition-colors ${selectedModel?.id === model.id ? 'bg-accent' : ''}`}
                    onClick={() => {
                      setSelectedModel(model);
                      setOpen(false);
                    }}
                    type="button"
                  >
                    <ModelAvatar model={model} size="md" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-base">{getModelName(model)}</span>
                      <span className="text-xs text-muted-foreground">{getProviderName(model)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}; 