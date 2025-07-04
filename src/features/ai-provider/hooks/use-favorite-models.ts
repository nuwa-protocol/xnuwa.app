import { ModelStateStore } from '../stores';
import type { Model } from '../types';

export function useFavoriteModels() {
  const favoriteModels = ModelStateStore((state) => state.favoriteModels);
  const addToFavorites = ModelStateStore((state) => state.addToFavorites);
  const removeFromFavorites = ModelStateStore(
    (state) => state.removeFromFavorites,
  );
  const isFavorite = (modelId: string) => {
    return favoriteModels.some((model) => model.id === modelId);
  };

  const toggleFavorite = (model: Model) => {
    if (isFavorite(model.id)) {
      removeFromFavorites(model.id);
    } else {
      addToFavorites(model);
    }
  };

  return {
    favoriteModels,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
  };
}
