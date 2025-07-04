import type { Model } from '../types';

export function isFreeModel(model: Model): boolean {
  const { pricing } = model;
  if (!pricing) return false;
  return (
    pricing.input_per_million_tokens === 0 &&
    pricing.output_per_million_tokens === 0 &&
    pricing.request_per_k_requests === 0
  );
}

export function getModelName(model: Model): string {
  return model.name;
}

export function getProviderName(model: Model): string {
  return model.providerName;
}

export function formatPricing(model: Model): string {
  const { pricing } = model;
  if (isFreeModel(model)) return 'Free';

  const inputPrice = pricing.input_per_million_tokens;
  const outputPrice = pricing.output_per_million_tokens;

  if (inputPrice === outputPrice) {
    return `$${inputPrice.toFixed(3)}`;
  }

  return `$${inputPrice.toFixed(3)} / $${outputPrice.toFixed(3)}`;
}

export function getModelSpeed(model: Model): string {
  if (model.context_length > 100000) return 'Medium';
  if (model.context_length > 32000) return 'Fast';
  return 'Very Fast';
}

export function getModelCategory(model: Model): string {
  const inputs = model.supported_inputs || [];

  if (inputs.includes('image')) {
    return 'multimodal';
  }

  if (
    model.name.toLowerCase().includes('code') ||
    model.name.toLowerCase().includes('coding')
  ) {
    return 'coding';
  }

  if (model.context_length > 32000) {
    return 'long-context';
  }

  return 'general';
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface Provider {
  id: string;
  name: string;
  count: number;
}

export function generateCategoriesAndProviders(models: Model[]): {
  categories: Category[];
  providers: Provider[];
} {
  const categoryMap = new Map<string, number>();
  const providerMap = new Map<string, number>();

  models.forEach((model) => {
    const category = getModelCategory(model);
    const provider = model.providerName;

    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    providerMap.set(provider, (providerMap.get(provider) || 0) + 1);
  });

  const categories: Category[] = Array.from(categoryMap.entries()).map(
    ([id, count]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1).replace('-', ' '),
      count,
    }),
  );

  const providers: Provider[] = Array.from(providerMap.entries())
    .map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, ''),
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return { categories, providers };
}
