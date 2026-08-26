import { OfflinePack, CalculatedRoute } from '../types/map';
import { OFFLINE_PACKS } from '../data/pakistanLocations';

const STORAGE_KEY_PACKS = 'pakistan_maps_offline_packs';
const STORAGE_KEY_SAVED_ROUTES = 'pakistan_maps_saved_routes';

// Initialize offline storage database
export class OfflineStorageManager {
  private static instance: OfflineStorageManager;
  private packs: OfflinePack[] = [];

  private constructor() {
    this.loadPacksFromStorage();
  }

  public static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  private loadPacksFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PACKS);
      if (stored) {
        const parsed = JSON.parse(stored) as OfflinePack[];
        // Merge with current definitions
        this.packs = OFFLINE_PACKS.map(basePack => {
          const found = parsed.find(p => p.id === basePack.id);
          return found || basePack;
        });
      } else {
        this.packs = [...OFFLINE_PACKS];
      }
    } catch (e) {
      console.warn('Could not read offline packs from localStorage:', e);
      this.packs = [...OFFLINE_PACKS];
    }
  }

  private savePacks(): void {
    try {
      localStorage.setItem(STORAGE_KEY_PACKS, JSON.stringify(this.packs));
    } catch (e) {
      console.warn('Could not save offline packs to localStorage:', e);
    }
  }

  public getPacks(): OfflinePack[] {
    return [...this.packs];
  }

  public async downloadPack(
    packId: string,
    onProgress: (progress: number) => void
  ): Promise<OfflinePack> {
    const packIndex = this.packs.findIndex(p => p.id === packId);
    if (packIndex === -1) throw new Error('Pack not found');

    const pack = this.packs[packIndex];

    // Simulate downloading vector tiles and routing graphs
    for (let p = 5; p <= 100; p += 15) {
      await new Promise(resolve => setTimeout(resolve, 200));
      pack.downloadProgress = Math.min(p, 100);
      onProgress(pack.downloadProgress);
    }

    pack.isDownloaded = true;
    pack.downloadProgress = 100;
    pack.lastUpdated = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    this.packs[packIndex] = { ...pack };
    this.savePacks();

    return pack;
  }

  public deletePack(packId: string): OfflinePack | null {
    const packIndex = this.packs.findIndex(p => p.id === packId);
    if (packIndex === -1) return null;

    this.packs[packIndex] = {
      ...this.packs[packIndex],
      isDownloaded: false,
      downloadProgress: 0,
      lastUpdated: undefined,
    };
    this.savePacks();
    return this.packs[packIndex];
  }

  public isLocationOfflineAvailable(lat: number, lng: number): boolean {
    return this.packs.some(pack => {
      if (!pack.isDownloaded) return false;
      const [[swLat, swLng], [neLat, neLng]] = pack.bounds;
      return lat >= swLat && lat <= neLat && lng >= swLng && lng <= neLng;
    });
  }

  public getSavedRoutes(): CalculatedRoute[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SAVED_ROUTES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public saveRouteOffline(route: CalculatedRoute): void {
    try {
      const routes = this.getSavedRoutes();
      const filtered = routes.filter(r => r.id !== route.id);
      filtered.unshift({ ...route, isOffline: true });
      localStorage.setItem(STORAGE_KEY_SAVED_ROUTES, JSON.stringify(filtered.slice(0, 20)));
    } catch (e) {
      console.warn('Could not save route offline:', e);
    }
  }
}
