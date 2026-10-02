/**
 * Weather & Haze Data Types
 */

export type RegionId = 'north' | 'south' | 'east' | 'west' | 'central';

export interface RegionLocation {
  name: RegionId;
  labelLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface PsiBandInfo {
  band: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  color: string;
  fillColor: string;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  min: number;
  max: number;
  generalAdvice: string;
  vulnerableAdvice: string;
}

export interface Pm25BandInfo {
  band: 'Band I (Normal)' | 'Band II (Elevated)' | 'Band III (High)' | 'Band IV (Very High)';
  shortBand: 'Normal' | 'Elevated' | 'High' | 'Very High';
  color: string;
  fillColor: string;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  min: number;
  max: number;
  generalAdvice: string;
}

export interface PsiItem {
  timestamp: string;
  updatedTimestamp?: string;
  readings: {
    psi_twenty_four_hourly: Record<RegionId, number>;
    pm25_twenty_four_hourly?: Record<RegionId, number>;
    pm10_twenty_four_hourly?: Record<RegionId, number>;
    o3_eight_hour_max?: Record<RegionId, number>;
    no2_one_hour_max?: Record<RegionId, number>;
    so2_twenty_four_hourly?: Record<RegionId, number>;
    co_eight_hour_max?: Record<RegionId, number>;
    [key: string]: any;
  };
}

export interface PsiData {
  regionMetadata: RegionLocation[];
  items: PsiItem[];
  timestamp: string;
  updatedTimestamp: string;
}

export interface Pm25Item {
  timestamp: string;
  updatedTimestamp?: string;
  readings: {
    pm25_one_hourly: Record<RegionId, number>;
  };
}

export interface Pm25Data {
  regionMetadata: RegionLocation[];
  items: Pm25Item[];
  timestamp: string;
  updatedTimestamp: string;
}

export interface RainfallStation {
  id: string;
  deviceId: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface RainfallReading {
  stationId: string;
  value: number; // mm in last 5 minutes
}

export interface RainfallData {
  stations: RainfallStation[];
  readings: RainfallReading[];
  readingType: string;
  readingUnit: string;
  timestamp: string;
}

export interface LightningStrike {
  id?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  type: 'C' | 'G' | string; // C = Cloud to Cloud, G = Cloud to Ground
  text: string;
  datetime: string;
  ageMinutes?: number;
}

export interface LightningData {
  strikes: LightningStrike[];
  recentCount30Min: number;
  updatedTimestamp: string;
}

export interface TwoHourForecastItem {
  area: string;
  forecast: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface TwoHourForecastData {
  validPeriod: {
    start: string;
    end: string;
    text: string;
  };
  updateTimestamp: string;
  forecasts: TwoHourForecastItem[];
}

export type ActiveLayer = 'psi' | 'pm25' | 'rain' | 'lightning' | 'combined';

export interface CombinedLayerState {
  showHaze: boolean;
  hazeMetric: 'psi' | 'pm25';
  showRain: boolean;
  showLightning: boolean;
}

export interface RegionSummaryInfo {
  id: RegionId;
  name: string;
  psi24: number;
  psiBand: PsiBandInfo;
  pm25_1hr: number;
  pm25Band: Pm25BandInfo;
  lastUpdated: string;
  additionalReadings?: {
    pm10?: number;
    no2?: number;
    so2?: number;
    co?: number;
    o3?: number;
  };
}
