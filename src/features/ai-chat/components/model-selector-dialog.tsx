import {
  ArrowDownAZ,
  ArrowDownNarrowWide,
  ArrowDownWideNarrow,
  ArrowUpDown,
  ChevronRight,
  Search,
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/shared/components/ui/select';
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useAvailableModels, useSelectedModel } from '../hooks';
import { useFavoriteModels } from '../hooks/use-favorite-models';
import type { Model } from '../types';
import {
  generateCategoriesAndProviders,
  getModelCategory,
  getModelName,
} from '../utils/model-utils';
import { AutoSettings } from './auto-settings';
import { ModelCard } from './model-card';
import { ModelSelectorSidebar } from './model-selector-sidebar';
import { ProviderAvatar } from './provider-avatar';

export const LLMModelSelector = ({ onClose }: { onClose: () => void }) => {
  const { models, loading, error } = useAvailableModels();
  const { selectedModel, setSelectedModel } = useSelectedModel();
  const { isFavorite } = useFavoriteModels();

  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>(
    'name',
  );

  // Auto settings
  const [autoFocusCategory, setAutoFocusCategory] = useState<string | null>(
    null,
  );
  const [autoOptimizationMetric, setAutoOptimizationMetric] = useState<
    'speed' | 'cost' | 'latency'
  >('speed');
  const [autoAdvancedSettings, setAutoAdvancedSettings] = useState(false);

  // Generate categories and providers from models
  const { categories, providers } = useMemo(() => {
    if (!models) return { categories: [], providers: [] };
    return generateCategoriesAndProviders(models);
  }, [models]);

  const getFilteredModels = () => {
    if (!models) return [];

    let filtered = [...models];

    if (selectedTab === 'favorite') {
      filtered = filtered.filter((model) => isFavorite(model.id));
    } else if (selectedTab === 'provider' && selectedProvider) {
      filtered = filtered.filter((model) => {
        const modelProviderId = model.providerName
          .toLowerCase()
          .replace(/\s+/g, '');
        return modelProviderId === selectedProvider;
      });
    } else if (selectedTab === 'auto') {
      if (autoFocusCategory) {
        filtered = filtered.filter(
          (model) => getModelCategory(model) === autoFocusCategory,
        );
      }

      if (autoOptimizationMetric === 'cost') {
        filtered.sort((a, b) => {
          const aPrice =
            a.pricing.input_per_million_tokens +
            a.pricing.output_per_million_tokens;
          const bPrice =
            b.pricing.input_per_million_tokens +
            b.pricing.output_per_million_tokens;
          return aPrice - bPrice;
        });
      }
    }

    if (searchQuery) {
      const keywords = searchQuery
        .trim()
        .split(/\s+/)
        .filter((keyword) => keyword.length > 0);

      filtered = filtered.filter((model) => {
        const modelName = model.name.toLowerCase();
        const providerName = model.providerName.toLowerCase();
        return keywords.every(
          (keyword) =>
            modelName.includes(keyword.toLowerCase()) ||
            providerName.includes(keyword.toLowerCase()),
        );
      });
    }

    // Apply sorting
    if (selectedTab !== 'auto') {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price-asc': {
            const aPrice =
              a.pricing.input_per_million_tokens +
              a.pricing.output_per_million_tokens;
            const bPrice =
              b.pricing.input_per_million_tokens +
              b.pricing.output_per_million_tokens;
            return aPrice - bPrice;
          }
          case 'price-desc': {
            const aPrice =
              a.pricing.input_per_million_tokens +
              a.pricing.output_per_million_tokens;
            const bPrice =
              b.pricing.input_per_million_tokens +
              b.pricing.output_per_million_tokens;
            return bPrice - aPrice;
          }
          default:
            return 0;
        }
      });
    }

    return filtered;
  };

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
    onClose();
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  const getMainContent = () => {
    if (selectedTab === 'provider' && selectedProvider) {
      const filteredModels = getFilteredModels();
      return renderModelGrid(filteredModels);
    }

    if (selectedTab === 'auto') {
      return (
        <AutoSettings
          categories={categories}
          autoFocusCategory={autoFocusCategory}
          autoOptimizationMetric={autoOptimizationMetric}
          autoAdvancedSettings={autoAdvancedSettings}
          recommendedModels={getFilteredModels().slice(0, 6)}
          selectedModel={selectedModel}
          onFocusCategoryChange={setAutoFocusCategory}
          onOptimizationMetricChange={setAutoOptimizationMetric}
          onAdvancedSettingsChange={setAutoAdvancedSettings}
          onModelSelect={handleModelSelect}
        />
      );
    }

    const filteredModels = getFilteredModels();
    return renderModelGrid(filteredModels);
  };

  const renderModelGrid = (modelList: Model[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {modelList.map((model) => (
        <ModelCard
          key={model.id}
          model={model}
          isSelected={selectedModel?.id === model.id}
          onClick={handleModelSelect}
        />
      ))}
    </div>
  );

  const getTitle = () => {
    if (selectedTab === 'auto') return 'Auto Settings & Recommendations';
    if (selectedTab === 'favorite') return 'Favorite Models';
    if (selectedTab === 'provider') {
      if (selectedProvider) {
        const provider = providers.find((p) => p.id === selectedProvider);
        return `${provider?.name} Models`;
      }
      return 'Providers';
    }
    return 'All Models';
  };

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="w-64 border-r border-border bg-background p-4">
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full mb-2" />
          <Skeleton className="h-8 w-full mb-2" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, () => (
              <Skeleton
                key={Math.random().toString(36)}
                className="h-32 w-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load models</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!models || models.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No models available</p>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <ModelSelectorSidebar
        selectedTab={selectedTab}
        selectedProvider={selectedProvider}
        providers={providers}
        onTabChange={handleTabChange}
        onProviderChange={setSelectedProvider}
      />

      <SidebarInset>
        <div className="p-6 border-b border-border h-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-2xl font-semibold">{getTitle()}</h2>
          </div>

          {selectedTab !== 'auto' && (
            <div className="flex gap-2 mx-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(value as 'name' | 'price-asc' | 'price-desc')
                }
              >
                <SelectTrigger className="w-16 px-3">
                  <ArrowUpDown className="size-4" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">
                    <div className="flex items-center gap-2">
                      <ArrowDownAZ className="h-4 w-4" />
                      Name
                    </div>
                  </SelectItem>
                  <SelectItem value="price-asc">
                    <div className="flex items-center gap-2">
                      <ArrowDownNarrowWide className="h-4 w-4" />
                      Price (Low to High)
                    </div>
                  </SelectItem>
                  <SelectItem value="price-desc">
                    <div className="flex items-center gap-2">
                      <ArrowDownWideNarrow className="h-4 w-4" />
                      Price (High to Low)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {/* Content */}
          <div className="flex-1 py-4 px-2 h-[calc(80vh-120px)] overflow-auto hide-scrollbar">
            {getMainContent()}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export const ModelSelectorDialog: React.FC = () => {
  const { selectedModel } = useSelectedModel();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-background hover:bg-accent transition-colors"
          type="button"
        >
          {selectedModel ? (
            <>
              <ProviderAvatar provider={selectedModel.providerName} size="sm" />
              <span className="truncate max-w-[100px] text-sm">
                {getModelName(selectedModel)}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </>
          ) : (
            <span className="text-muted-foreground text-sm">Select Model</span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[80vh] p-0 overflow-hidden">
        <LLMModelSelector onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
