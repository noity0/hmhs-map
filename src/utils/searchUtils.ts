import { RoutePoint } from '../types/map';
import { MAJOR_CITIES, FAMOUS_GULLIES_AND_STREETS } from '../data/pakistanLocations';
import { KARACHI_AREAS } from '../data/karachiAreas';
import { WORLD_CITIES, WORLD_LANDMARKS } from '../data/worldwideLocations';
import { searchPakistanLocations as searchOnlineGeocode } from '../services/nominatimService';

// Alias dictionary for common location terms & shorthand codes
const ALIAS_MAP: Record<string, string[]> = {
  // Global & International Shortcuts
  'nyc': ['new york', 'manhattan', 'times square', 'brooklyn'],
  'ny': ['new york'],
  'la': ['los angeles', 'hollywood', 'california'],
  'sf': ['san francisco', 'silicon valley'],
  'dxb': ['dubai', 'burj khalifa', 'uae'],
  'uae': ['united arab emirates', 'dubai', 'abu dhabi', 'sharjah'],
  'ksa': ['saudi arabia', 'makkah', 'madinah', 'riyadh', 'jeddah'],
  'uk': ['united kingdom', 'london', 'england'],
  'usa': ['united states', 'america'],
  'us': ['united states'],
  'mecca': ['makkah', 'kaaba', 'masjid al haram'],
  'medina': ['madinah', 'masjid an nabawi'],
  'haram': ['masjid al-haram', 'makkah', 'masjid an-nabawi'],
  'kaaba': ['makkah', 'masjid al-haram'],
  'burj': ['burj khalifa', 'dubai'],
  'eiffel': ['eiffel tower', 'paris'],

  // Local Shortcuts
  'dha': ['defence', 'defense', 'khayaban', 'bukhari', 'shahbaz', 'ittehad', 'seaview'],
  'khi': ['karachi'],
  'lhr': ['lahore'],
  'isb': ['islamabad'],
  'rwp': ['rawalpindi'],
  'pew': ['peshawar'],
  'qta': ['quetta'],
  'fsd': ['faisalabad'],
  'mux': ['multan'],
  'hyd': ['hyderabad'],
  'skr': ['sukkur'],
  'gwd': ['gwadar'],
  'f7': ['f-7', 'super market'],
  'f-7': ['f7', 'super market'],
  'f6': ['f-6'],
  'f8': ['f-8'],
  'f10': ['f-10'],
  'f11': ['f-11'],
  'g6': ['g-6'],
  'g7': ['g-7'],
  'g8': ['g-8'],
  'g9': ['g-9', 'karachi company'],
  'g10': ['g-10'],
  'g11': ['g-11'],
  'i8': ['i-8'],
  'i9': ['i-9'],
  'i10': ['i-10'],
  'johar': ['gulistan-e-johar', 'johar town', 'kamran chowrangi', 'perfume chowk'],
  'gulshan': ['gulshan-e-iqbal', 'nipa', 'disco bakery', 'hassan square'],
  'clifton': ['sea view', 'boat basin', 'do darya', 'bilawal', 'teen talwar'],
  'tariq': ['tariq road', 'pechs', 'qurtaba'],
  'nipa': ['gulshan-e-iqbal', 'university road'],
  'seaview': ['sea view', 'clifton', 'dha'],
  'airport': ['jinnah international', 'allama iqbal', 'islamabad international', 'drigh road', 'heathrow', 'jfk', 'dubai international'],
};

// Normalize search strings for fuzzy matching
export function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .replace(/[-_.,/()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Local Search Filter Engine
export function filterLocalLocations(query: string, limit = 25): RoutePoint[] {
  if (!query || query.trim().length === 0) return [];

  const rawQ = query.trim().toLowerCase();
  const normQ = normalizeStr(query);
  const qTokens = normQ.split(' ').filter(Boolean);

  // Expand query with aliases if applicable
  const expandedTokens = new Set<string>(qTokens);
  qTokens.forEach(t => {
    if (ALIAS_MAP[t]) {
      ALIAS_MAP[t].forEach(alt => expandedTokens.add(normalizeStr(alt)));
    }
  });

  const allItems: (RoutePoint & { popularSpots?: string[] })[] = [
    ...WORLD_LANDMARKS,
    ...WORLD_CITIES,
    ...KARACHI_AREAS,
    ...MAJOR_CITIES,
    ...FAMOUS_GULLIES_AND_STREETS,
  ];

  const scoredResults: { item: RoutePoint; score: number }[] = [];

  for (const item of allItems) {
    let score = 0;
    const nameNorm = normalizeStr(item.name);
    const urduStr = item.urduName || '';
    const cityNorm = item.city ? normalizeStr(item.city) : '';
    const provNorm = item.province ? normalizeStr(item.province) : '';
    const addrNorm = item.address ? normalizeStr(item.address) : '';
    const spotsStr = item.popularSpots ? item.popularSpots.map(s => normalizeStr(s)).join(' ') : '';

    const combinedText = `${nameNorm} ${cityNorm} ${provNorm} ${addrNorm} ${spotsStr}`;

    // Exact name match bonus
    if (nameNorm === normQ || rawQ === item.name.toLowerCase()) score += 100;
    else if (nameNorm.startsWith(normQ)) score += 60;
    else if (nameNorm.includes(normQ)) score += 40;

    // Urdu string match
    if (urduStr && urduStr.includes(rawQ)) score += 50;

    // Token matches
    let tokenMatches = 0;
    expandedTokens.forEach(t => {
      if (combinedText.includes(t)) {
        tokenMatches += 1;
      }
    });

    if (tokenMatches > 0) {
      score += tokenMatches * 15;
    }

    if (score > 0) {
      scoredResults.push({ item, score });
    }
  }

  scoredResults.sort((a, b) => b.score - a.score);

  return scoredResults.map(r => r.item).slice(0, limit);
}

// Unified Search Method (Local + Online Geocoder)
export async function executeUniversalSearch(
  query: string,
  isOfflineMode = false
): Promise<{ localResults: RoutePoint[]; onlineResults: RoutePoint[]; combinedResults: RoutePoint[] }> {
  if (!query || query.trim().length < 2) {
    return { localResults: [], onlineResults: [], combinedResults: [] };
  }

  const localResults = filterLocalLocations(query, 25);

  let onlineResults: RoutePoint[] = [];
  if (!isOfflineMode) {
    try {
      onlineResults = await searchOnlineGeocode(query);
    } catch (e) {
      onlineResults = [];
    }
  }

  // Deduplicate and combine
  const resultMap = new Map<string, RoutePoint>();

  // Add local results first
  localResults.forEach(l => resultMap.set(l.id, l));

  // Add online results that don't duplicate local results by name or lat/lng
  onlineResults.forEach(online => {
    const isDup = Array.from(resultMap.values()).some(existing => {
      const nameMatch = existing.name.toLowerCase() === online.name.toLowerCase();
      const distLat = Math.abs(existing.lat - online.lat);
      const distLng = Math.abs(existing.lng - online.lng);
      return nameMatch || (distLat < 0.002 && distLng < 0.002);
    });

    if (!isDup) {
      resultMap.set(online.id, online);
    }
  });

  const combinedResults = Array.from(resultMap.values()).slice(0, 30);

  return {
    localResults,
    onlineResults,
    combinedResults,
  };
}
