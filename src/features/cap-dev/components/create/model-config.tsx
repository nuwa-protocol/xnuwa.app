import {
  CheckCircle2,
  Clock,
  DollarSign,
  Search,
  Sparkles
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ModelStateStore } from '@/features/cap-dev/stores/model-stores';
import {
  Avatar,
  AvatarFallback, Badge,
  Button,
  Card,
  CardContent,
  CardDescription, CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui';
import type { Model } from '@/shared/types/model';
import { cn } from '@/shared/utils';

interface ModelConfigProps {
  onModelSelect?: (model: Model) => void;
}

const modelCategories = [
  { id: 'all', name: 'All Models', count: 0 },
  { id: 'gpt', name: 'OpenAI GPT', count: 0 },
  { id: 'claude', name: 'Anthropic Claude', count: 0 },
  { id: 'gemini', name: 'Google Gemini', count: 0 },
  { id: 'llama', name: 'Meta LLaMA', count: 0 },
  { id: 'other', name: 'Other', count: 0 },
];

const modelFeatures = [
  { id: 'reasoning', name: 'Strong Reasoning', icon: Sparkles },
  { id: 'coding', name: 'Code Generation', icon: CheckCircle2 },
  { id: 'speed', name: 'Fast Response', icon: Clock },
  { id: 'cost', name: 'Cost Effective', icon: DollarSign },
];

export function ModelConfig({ onModelSelect }: ModelConfigProps) {
  const {
    availableModels,
    selectedModel,
    isLoadingModels,
    setSelectedModel,
    fetchAvailableModels,
  } = ModelStateStore();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModelBrowser, setShowModelBrowser] = useState(false);

  useEffect(() => {
    if (!availableModels) {
      fetchAvailableModels();
    }
  }, [fetchAvailableModels, availableModels]);

  const handleModelSelect = (model: Model) => {
    setSelectedModel(model);
    onModelSelect?.(model);
    setShowModelBrowser(false);
  };

  const models = availableModels || [];
  const categoryModels =
    selectedCategory === 'all'
      ? models
      : models.filter(
          (model) =>
            model.name.toLowerCase().includes(selectedCategory) ||
            model.providerName?.toLowerCase().includes(selectedCategory),
        );

  const getProviderIcon = (provider?: string) => {
    if (!provider) return null;
    const p = provider.toLowerCase();
    if (p.includes('openai')) return '🤖';
    if (p.includes('anthropic')) return '🔮';
    if (p.includes('google')) return '🌈';
    if (p.includes('meta')) return '🦙';
    return '⚡';
  };

  const getModelScore = (model: Model) => {
    let score = 70; // Base score

    // Adjust based on context window
    if (model.context_length && model.context_length > 100000) score += 15;
    else if (model.context_length && model.context_length > 32000) score += 10;
    else if (model.context_length && model.context_length > 8000) score += 5;

    // Popular models bonus
    if (model.name.includes('gpt-4')) score += 20;
    if (model.name.includes('claude-3')) score += 20;
    if (model.name.includes('gemini')) score += 15;

    return Math.min(score, 95);
  };

  return (
    <div className="space-y-4">
      {/* Current Selection */}
      {selectedModel ? (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {getProviderIcon(selectedModel.providerName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{selectedModel.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedModel.providerName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge>Score: {getModelScore(selectedModel)}</Badge>
                <Dialog
                  open={showModelBrowser}
                  onOpenChange={setShowModelBrowser}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change Model
                    </Button>
                  </DialogTrigger>
                  <ModelBrowserDialog
                    models={categoryModels}
                    selectedModel={selectedModel}
                    onSelectModel={handleModelSelect}
                    isLoading={isLoadingModels}
                  />
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg text-muted-foreground mb-2">
              No Model Selected
            </CardTitle>
            <CardDescription className="mb-4">
              Choose an AI model to power your cap's responses and behavior
            </CardDescription>
            <Dialog open={showModelBrowser} onOpenChange={setShowModelBrowser}>
              <DialogTrigger asChild>
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Browse Models
                </Button>
              </DialogTrigger>
              <ModelBrowserDialog
                models={categoryModels}
                selectedModel={selectedModel}
                onSelectModel={handleModelSelect}
                isLoading={isLoadingModels}
              />
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      {selectedModel && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-muted-foreground">Context Window</p>
            <p className="font-medium">
              {selectedModel.context_length?.toLocaleString() || 'Unknown'}{' '}
              tokens
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Provider</p>
            <p className="font-medium">{selectedModel.providerName || 'Unknown'}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface ModelBrowserDialogProps {
  models: Model[];
  selectedModel?: Model;
  onSelectModel: (model: Model) => void;
  isLoading: boolean;
}

function ModelBrowserDialog({
  models,
  selectedModel,
  onSelectModel,
  isLoading,
}: ModelBrowserDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const getModelScore = (model: Model) => {
    let score = 70;
    if (model.context_length && model.context_length > 100000) score += 15;
    else if (model.context_length && model.context_length > 32000) score += 10;
    else if (model.context_length && model.context_length > 8000) score += 5;

    if (model.name.includes('gpt-4')) score += 20;
    if (model.name.includes('claude-3')) score += 20;
    if (model.name.includes('gemini')) score += 15;

    return Math.min(score, 95);
  };

  const filteredModels = models.filter((model) => {
    const matchesSearch = searchQuery === '' || 
      model.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ||
      model.name.toLowerCase().includes(selectedCategory) ||
      model.providerName?.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const getProviderIcon = (provider?: string) => {
    if (!provider) return '⚡';
    const p = provider.toLowerCase();
    if (p.includes('openai')) return '🤖';
    if (p.includes('anthropic')) return '🔮';
    if (p.includes('google')) return '🌈';
    if (p.includes('meta')) return '🦙';
    return '⚡';
  };

  return (
    <DialogContent className="max-w-4xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>Choose Model</DialogTitle>
        <DialogDescription>
          Select the AI model that best fits your cap's requirements
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modelCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Features Filter */}
        <div className="flex flex-wrap gap-2">
          {modelFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Badge
                key={feature.id}
                variant="outline"
                className="cursor-pointer hover:bg-muted"
              >
                <Icon className="h-3 w-3 mr-1" />
                {feature.name}
              </Badge>
            );
          })}
        </div>

        {/* Models Grid */}
        <div className="grid gap-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading models...</p>
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No models found</p>
            </div>
          ) : (
            filteredModels.map((model) => {
              const score = getModelScore(model);
              const isSelected = selectedModel?.id === model.id;

              return (
                <Card
                  key={model.id}
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    isSelected && 'ring-2 ring-primary bg-primary/5',
                  )}
                  onClick={() => onSelectModel(model)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {getProviderIcon(model.providerName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate">
                            {model.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {model.providerName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            score >= 85
                              ? 'default'
                              : score >= 75
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {score}
                        </Badge>
                        {isSelected && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Context:{' '}
                        {model.context_length?.toLocaleString() || 'Unknown'}{' '}
                        tokens
                      </span>
                      {model.pricing && (
                        <span>${model.pricing.input_per_million_tokens || 'N/A'}/1M tokens</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </DialogContent>
  );
}
