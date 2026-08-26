import { RoutePoint } from '../types/map';

const FAVORITES_KEY = 'hmhs_starred_places_v1';

export const favoritesService = {
  getFavorites(): RoutePoint[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isFavorite(pointId: string | undefined): boolean {
    if (!pointId) return false;
    const favorites = this.getFavorites();
    return favorites.some(p => p.id === pointId || (p.lat === Number(pointId.split(',')[0]) && p.lng === Number(pointId.split(',')[1])));
  },

  toggleFavorite(point: RoutePoint): boolean {
    const favorites = this.getFavorites();
    const index = favorites.findIndex(p => p.id === point.id || (p.lat === point.lat && p.lng === point.lng));
    
    let updated: RoutePoint[];
    let isNowFav = false;
    
    if (index >= 0) {
      updated = favorites.filter((_, i) => i !== index);
      isNowFav = false;
    } else {
      updated = [{ ...point, isFavorite: true }, ...favorites];
      isNowFav = true;
    }

    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    return isNowFav;
  }
};
