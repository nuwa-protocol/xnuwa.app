import type { CapModel } from '@/shared/types/cap';

export function getModelName(model: CapModel): string {
  return model.name;
}

export function getProviderName(model: CapModel): string {
  return model.providerName;
}

export interface Provider {
  id: string;
  name: string;
  count: number;
}

export function generateProviders(models: CapModel[]): {
  providers: Provider[];
} {
  const providerMap = new Map<string, { name: string; count: number }>();

  models.forEach((model) => {
    const providerName = model.providerName;
    const providerId = providerName.toLowerCase().replace(/\s+/g, '');

    const existingProvider = providerMap.get(providerId);
    if (existingProvider) {
      existingProvider.count += 1;
    } else {
      providerMap.set(providerId, { name: providerName, count: 1 });
    }
  });

  const providers: Provider[] = Array.from(providerMap.entries())
    .map(([id, { name, count }]) => ({
      id,
      name,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return { providers };
}
