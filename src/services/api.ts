import { CONFIG } from '../config/endpoints';
import {
  PsiData,
  Pm25Data,
  RainfallData,
  LightningData,
  TwoHourForecastData,
  RegionId,
  RegionSummaryInfo,
  LightningStrike,
} from '../types/weather';
import { getPsiBand, getPm25Band } from '../utils/advisory';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

async function fetchWithCache<T>(
  url: string,
  cacheKey: string,
  ttlMs = CONFIG.cacheDurationMs,
  fallbackUrl?: string
): Promise<T> {
  const cached = memoryCache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data as T;
  }

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      if (fallbackUrl && res.status === 404) {
        console.warn(`Primary URL ${url} returned 404, using fallback URL ${fallbackUrl}`);
        const fallbackRes = await fetch(fallbackUrl, {
          headers: { Accept: 'application/json' },
        });
        if (!fallbackRes.ok) {
          throw new Error(`HTTP error ${fallbackRes.status} from fallback ${fallbackUrl}`);
        }
        const json = await fallbackRes.json();
        memoryCache.set(cacheKey, { data: json, timestamp: now });
        return json as T;
      }
      throw new Error(`HTTP error ${res.status} from ${url}`);
    }

    const json = await res.json();
    memoryCache.set(cacheKey, { data: json, timestamp: now });
    return json as T;
  } catch (error) {
    // If request failed but we have older cached data, return it
    if (cached) {
      console.warn(`Fetch failed for ${cacheKey}, returning stale cached data`, error);
      return cached.data as T;
    }
    throw error;
  }
}

/**
 * Fetch 24-hour PSI by region
 */
export async function fetchPsi(): Promise<PsiData> {
  const res = await fetchWithCache<any>(CONFIG.endpoints.psi, 'psi');
  const items = res?.data?.items || [];
  const latestItem = items[items.length - 1] || { readings: { psi_twenty_four_hourly: {} } };

  return {
    regionMetadata: res?.data?.regionMetadata || [],
    items,
    timestamp: latestItem.timestamp || new Date().toISOString(),
    updatedTimestamp: latestItem.updatedTimestamp || new Date().toISOString(),
  };
}

/**
 * Fetch 1-hour PM2.5 by region
 */
export async function fetchPm25(): Promise<Pm25Data> {
  const res = await fetchWithCache<any>(CONFIG.endpoints.pm25, 'pm25');
  const items = res?.data?.items || [];
  const latestItem = items[items.length - 1] || { readings: { pm25_one_hourly: {} } };

  return {
    regionMetadata: res?.data?.regionMetadata || [],
    items,
    timestamp: latestItem.timestamp || new Date().toISOString(),
    updatedTimestamp: latestItem.updatedTimestamp || new Date().toISOString(),
  };
}

/**
 * Fetch 5-minute rainfall readings by station
 */
export async function fetchRainfall(): Promise<RainfallData> {
  const res = await fetchWithCache<any>(CONFIG.endpoints.rainfall, 'rainfall');
  const stations = res?.data?.stations || [];
  const readingsObj = res?.data?.readings || [];
  const latestReading = readingsObj[readingsObj.length - 1] || { data: [], timestamp: '' };

  return {
    stations,
    readings: latestReading.data || [],
    readingType: res?.data?.readingType || 'TB1 Rainfall 5 Minute Total F',
    readingUnit: res?.data?.readingUnit || 'mm',
    timestamp: latestReading.timestamp || new Date().toISOString(),
  };
}

/**
 * Fetch Lightning observations
 */
export async function fetchLightning(): Promise<LightningData> {
  const res = await fetchWithCache<any>(
    CONFIG.endpoints.lightning,
    'lightning',
    CONFIG.cacheDurationMs,
    CONFIG.endpoints.lightningFallback
  );

  const strikes: LightningStrike[] = [];
  const records = res?.data?.records || [];
  const now = Date.now();
  const thirtyMinsMs = 30 * 60 * 1000;

  records.forEach((record: any) => {
    const recordTime = record.datetime ? new Date(record.datetime).getTime() : now;
    const readings = record?.item?.readings || [];
    readings.forEach((reading: any, idx: number) => {
      const strikeTime = reading.datetime ? new Date(reading.datetime).getTime() : recordTime;
      const ageMinutes = Math.max(0, Math.round((now - strikeTime) / (60 * 1000)));
      const lat = parseFloat(reading.location?.latitude);
      const lng = parseFloat(reading.location?.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        strikes.push({
          id: `strike-${recordTime}-${idx}`,
          location: { latitude: lat, longitude: lng },
          type: reading.type || 'C',
          text: reading.text || (reading.type === 'G' ? 'Cloud to Ground' : 'Cloud to Cloud'),
          datetime: reading.datetime || record.datetime,
          ageMinutes,
        });
      }
    });
  });

  const recentStrikes = strikes.filter(s => {
    const t = new Date(s.datetime).getTime();
    return !isNaN(t) && now - t <= thirtyMinsMs;
  });

  return {
    strikes,
    recentCount30Min: recentStrikes.length,
    updatedTimestamp: records[0]?.updatedTimestamp || new Date().toISOString(),
  };
}

/**
 * Fetch 2-hour weather forecast by planning area
 */
export async function fetchTwoHourForecast(): Promise<TwoHourForecastData> {
  const res = await fetchWithCache<any>(CONFIG.endpoints.twoHourForecast, 'forecast');
  const items = res?.data?.items || [];
  const latestItem = items[items.length - 1] || {};
  const metadata = res?.data?.area_metadata || [];

  const metaMap = new Map<string, { latitude: number; longitude: number }>();
  metadata.forEach((m: any) => {
    if (m.name && m.label_location) {
      metaMap.set(m.name, m.label_location);
    }
  });

  const forecasts = (latestItem.forecasts || []).map((f: any) => ({
    area: f.area,
    forecast: f.forecast,
    location: metaMap.get(f.area),
  }));

  return {
    validPeriod: latestItem.valid_period || {
      start: '',
      end: '',
      text: 'Next 2 Hours',
    },
    updateTimestamp: latestItem.update_timestamp || new Date().toISOString(),
    forecasts,
  };
}

/**
 * Compile region summaries for table and map display
 */
export function buildRegionSummaries(
  psiData: PsiData | null,
  pm25Data: Pm25Data | null
): RegionSummaryInfo[] {
  const regions: RegionId[] = ['north', 'south', 'east', 'west', 'central'];
  const regionNames: Record<RegionId, string> = {
    north: 'North',
    south: 'South',
    east: 'East',
    west: 'West',
    central: 'Central',
  };

  const latestPsi = psiData?.items?.[psiData.items.length - 1]?.readings?.psi_twenty_four_hourly;
  const latestPm25 = pm25Data?.items?.[pm25Data.items.length - 1]?.readings?.pm25_one_hourly;
  const allPsiReadings = psiData?.items?.[psiData.items.length - 1]?.readings;

  return regions.map(id => {
    const psiVal = latestPsi?.[id] ?? 50;
    const pm25Val = latestPm25?.[id] ?? 20;

    return {
      id,
      name: regionNames[id],
      psi24: psiVal,
      psiBand: getPsiBand(psiVal),
      pm25_1hr: pm25Val,
      pm25Band: getPm25Band(pm25Val),
      lastUpdated: psiData?.updatedTimestamp || new Date().toISOString(),
      additionalReadings: {
        pm10: allPsiReadings?.pm10_twenty_four_hourly?.[id],
        no2: allPsiReadings?.no2_one_hour_max?.[id],
        so2: allPsiReadings?.so2_twenty_four_hourly?.[id],
        co: allPsiReadings?.co_eight_hour_max?.[id],
        o3: allPsiReadings?.o3_eight_hour_max?.[id],
      },
    };
  });
}

/**
 * Force clear memory cache (for manual refresh button)
 */
export function clearApiCache(): void {
  memoryCache.clear();
}
