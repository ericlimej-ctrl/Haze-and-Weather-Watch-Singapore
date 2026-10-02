/**
 * SG Weather & Haze Watch
 * Real-time NEA & MSS Singapore Weather, 24-hr PSI, 1-hr PM2.5, Rainfall, and Lightning
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { SummaryBanner } from './components/SummaryBanner';
import { LayerTabs } from './components/LayerTabs';
import { MapView } from './components/MapView';
import { RegionTable } from './components/RegionTable';
import { Legend } from './components/Legend';
import { RegionModal } from './components/RegionModal';
import { TwoHourForecastList } from './components/TwoHourForecastList';
import { BottomSheet } from './components/BottomSheet';
import { Footer } from './components/Footer';

import {
  ActiveLayer,
  CombinedLayerState,
  RegionId,
  RegionSummaryInfo,
  PsiData,
  Pm25Data,
  RainfallData,
  LightningData,
  TwoHourForecastData,
} from './types/weather';

import {
  fetchPsi,
  fetchPm25,
  fetchRainfall,
  fetchLightning,
  fetchTwoHourForecast,
  buildRegionSummaries,
  clearApiCache,
} from './services/api';
import { CONFIG } from './config/endpoints';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

export default function App() {
  const [activeLayer, setActiveLayer] = useState<ActiveLayer>('psi');
  const [combinedState, setCombinedState] = useState<CombinedLayerState>({
    showHaze: true,
    hazeMetric: 'psi',
    showRain: true,
    showLightning: true,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [psiData, setPsiData] = useState<PsiData | null>(null);
  const [pm25Data, setPm25Data] = useState<Pm25Data | null>(null);
  const [rainfallData, setRainfallData] = useState<RainfallData | null>(null);
  const [lightningData, setLightningData] = useState<LightningData | null>(null);
  const [forecastData, setForecastData] = useState<TwoHourForecastData | null>(null);

  const [regionSummaries, setRegionSummaries] = useState<RegionSummaryInfo[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<RegionId | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Auto-refresh countdown (5 minutes = 300s)
  const [countdown, setCountdown] = useState<number>(300);

  // Demo storm simulation toggle
  const [isSimulatedDemo, setIsSimulatedDemo] = useState<boolean>(false);

  // Fetch all data
  const loadWeatherData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
      clearApiCache();
    } else {
      setIsLoading(true);
    }
    setHasError(false);
    setErrorMessage(null);

    try {
      const [psiRes, pm25Res, rainRes, lightningRes, forecastRes] =
        await Promise.allSettled([
          fetchPsi(),
          fetchPm25(),
          fetchRainfall(),
          fetchLightning(),
          fetchTwoHourForecast(),
        ]);

      let newPsi: PsiData | null = null;
      let newPm25: Pm25Data | null = null;
      let newRain: RainfallData | null = null;
      let newLightning: LightningData | null = null;
      let newForecast: TwoHourForecastData | null = null;

      if (psiRes.status === 'fulfilled') {
        newPsi = psiRes.value;
        setPsiData(newPsi);
      }
      if (pm25Res.status === 'fulfilled') {
        newPm25 = pm25Res.value;
        setPm25Data(newPm25);
      }
      if (rainRes.status === 'fulfilled') {
        newRain = rainRes.value;
        setRainfallData(newRain);
      }
      if (lightningRes.status === 'fulfilled') {
        newLightning = lightningRes.value;
        setLightningData(newLightning);
      }
      if (forecastRes.status === 'fulfilled') {
        newForecast = forecastRes.value;
        setForecastData(newForecast);
      }

      // If at least PSI or PM25 succeeded, build region summaries
      const summaries = buildRegionSummaries(
        newPsi || psiData,
        newPm25 || pm25Data
      );
      setRegionSummaries(summaries);

      const latestStamp =
        newPsi?.updatedTimestamp ||
        newPm25?.updatedTimestamp ||
        newRain?.timestamp ||
        new Date().toISOString();
      setLastUpdated(latestStamp);

      // Reset auto-refresh timer to 5 minutes
      setCountdown(300);
    } catch (err: any) {
      console.error('Error fetching weather data:', err);
      setHasError(true);
      setErrorMessage(
        err?.message || 'Failed to update live observations from NEA. Using last known data.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [psiData, pm25Data]);

  // Initial load
  useEffect(() => {
    loadWeatherData();
  }, []);

  // 1-second countdown ticker for auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadWeatherData();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loadWeatherData]);

  const selectedRegion = regionSummaries.find(r => r.id === selectedRegionId) || null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans antialiased">
      {/* 1. High-contrast Navy Header */}
      <Header
        lastUpdated={lastUpdated}
        isLoading={isLoading || isRefreshing}
        onRefresh={() => loadWeatherData(true)}
        nextRefreshSeconds={countdown}
        hasError={hasError}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col space-y-3 pb-20 md:pb-6">
        {/* 2. Top Summary & Lightning Alert Banner */}
        <SummaryBanner
          regionSummaries={regionSummaries}
          lightningData={lightningData}
          rainfallData={rainfallData}
        />

        {/* 3. Layer Selector / Tabs */}
        <LayerTabs
          activeLayer={activeLayer}
          onSelectLayer={setActiveLayer}
          combinedState={combinedState}
          onUpdateCombinedState={setCombinedState}
          isSimulatedDemo={isSimulatedDemo}
          onToggleSimulatedDemo={() => setIsSimulatedDemo(!isSimulatedDemo)}
        />

        {/* 4. Desktop Split Layout / Mobile Full-Screen Map */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 items-start min-h-[500px]">
          {/* Left Panel: Desktop Table, Forecast & Legend (Hidden on small mobile, handled by bottom sheet) */}
          <div className="hidden md:flex md:col-span-5 flex-col space-y-4">
            {/* Regional Table */}
            <RegionTable
              regions={regionSummaries}
              selectedRegionId={selectedRegionId}
              onSelectRegion={setSelectedRegionId}
            />

            {/* Legend */}
            <Legend activeLayer={activeLayer} />

            {/* 2-Hour Weather Forecast by Area */}
            <TwoHourForecastList forecastData={forecastData} />
          </div>

          {/* Right Panel: Interactive Map View */}
          <div className="col-span-1 md:col-span-7 h-[65vh] md:h-[680px] w-full flex flex-col">
            {isLoading && regionSummaries.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
                <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
                <div className="text-sm font-semibold text-slate-700">
                  Loading Singapore NEA real-time observations...
                </div>
                <div className="text-xs text-slate-400">
                  Connecting to data.gov.sg &amp; OneMap
                </div>
              </div>
            ) : (
              <MapView
                activeLayer={activeLayer}
                combinedState={combinedState}
                regionSummaries={regionSummaries}
                rainfallData={rainfallData}
                lightningData={lightningData}
                selectedRegionId={selectedRegionId}
                onSelectRegion={setSelectedRegionId}
                isSimulatedDemo={isSimulatedDemo}
              />
            )}
          </div>
        </div>
      </main>

      {/* Mobile Draggable Bottom Sheet */}
      <BottomSheet
        title="Air Quality &amp; Forecast"
        summaryText={
          regionSummaries.length > 0
            ? `North ${regionSummaries.find(r => r.id === 'north')?.psi24} PSI | Central ${regionSummaries.find(r => r.id === 'central')?.psi24} PSI`
            : undefined
        }
      >
        <div className="space-y-4 pt-1">
          <RegionTable
            regions={regionSummaries}
            selectedRegionId={selectedRegionId}
            onSelectRegion={setSelectedRegionId}
          />
          <Legend activeLayer={activeLayer} />
          <TwoHourForecastList forecastData={forecastData} />
        </div>
      </BottomSheet>

      {/* Region Detail Modal */}
      <RegionModal
        region={selectedRegion}
        onClose={() => setSelectedRegionId(null)}
      />

      {/* 5. Attribution Footer */}
      <Footer />
    </div>
  );
}
