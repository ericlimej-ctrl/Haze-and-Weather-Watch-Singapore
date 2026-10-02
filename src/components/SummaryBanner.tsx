import React from 'react';
import { Zap, AlertTriangle, ShieldCheck, CloudRain, Info } from 'lucide-react';
import { RegionSummaryInfo, LightningData, RainfallData } from '../types/weather';

interface SummaryBannerProps {
  regionSummaries: RegionSummaryInfo[];
  lightningData: LightningData | null;
  rainfallData: RainfallData | null;
}

export const SummaryBanner: React.FC<SummaryBannerProps> = ({
  regionSummaries,
  lightningData,
  rainfallData,
}) => {
  // Find highest PSI region
  const highestPsiRegion = [...regionSummaries].sort((a, b) => b.psi24 - a.psi24)[0];
  const highestPm25Region = [...regionSummaries].sort((a, b) => b.pm25_1hr - a.pm25_1hr)[0];

  // Count lightning strikes in last 30 mins
  const lightningCount = lightningData?.recentCount30Min ?? 0;
  const hasLightning = lightningCount > 0;

  // Active raining stations count
  const rainingStations = (rainfallData?.readings || []).filter(r => r.value > 0);
  const maxRainStationReading = (rainfallData?.readings || []).reduce((max, r) => Math.max(max, r.value), 0);

  return (
    <div className="w-full space-y-2">
      {/* High-Priority Lightning Warning Banner */}
      {hasLightning && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2.5 rounded-lg shadow-sm border border-amber-500/50 flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-2.5">
            <span className="p-1 bg-white/20 rounded-md">
              <Zap className="w-5 h-5 text-amber-200 fill-amber-300" />
            </span>
            <div>
              <span className="font-bold text-sm">
                Lightning Warning: {lightningCount} strike{lightningCount > 1 ? 's' : ''} detected in the last 30 minutes!
              </span>
              <p className="text-xs text-amber-100 hidden sm:block">
                Take immediate shelter indoors or in vehicles. Avoid open fields, elevated areas, and water bodies.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-white/20 rounded text-xs font-semibold uppercase tracking-wider">
            LDS Alert
          </span>
        </div>
      )}

      {/* Air Quality & Weather Condition Overview Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-800">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          {/* Highest PSI Indicator */}
          {highestPsiRegion ? (
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: highestPsiRegion.psiBand.color }}
              />
              <span className="text-slate-500 font-medium">Highest 24-hr PSI:</span>
              <span className="font-semibold text-slate-900">
                {highestPsiRegion.name} ({highestPsiRegion.psi24})
              </span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: highestPsiRegion.psiBand.color }}
              >
                {highestPsiRegion.psiBand.band}
              </span>
            </div>
          ) : (
            <div className="text-slate-400">Loading PSI observations...</div>
          )}

          {/* Divider */}
          <span className="hidden md:inline text-slate-300">|</span>

          {/* Highest 1-hr PM2.5 */}
          {highestPm25Region && (
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-medium">Peak 1-hr PM2.5:</span>
              <span className="font-semibold text-slate-900">
                {highestPm25Region.name} ({highestPm25Region.pm25_1hr} µg/m³)
              </span>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: highestPm25Region.pm25Band.color }}
              >
                {highestPm25Region.pm25Band.shortBand}
              </span>
            </div>
          )}

          {/* Divider */}
          <span className="hidden lg:inline text-slate-300">|</span>

          {/* Rain status summary */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600">
            <CloudRain className="w-4 h-4 text-sky-500 shrink-0" />
            <span>
              {rainingStations.length > 0
                ? `${rainingStations.length} rain stations reporting showers (max ${maxRainStationReading.toFixed(1)} mm)`
                : 'No precipitation reported at NEA stations'}
            </span>
          </div>
        </div>

        {/* Lightning Status Badge */}
        <div className="flex items-center space-x-2 self-start md:self-auto shrink-0">
          {!hasLightning ? (
            <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>No lightning detected (past 30m)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-xs px-2.5 py-1 bg-amber-50 text-amber-900 rounded-md border border-amber-300 font-medium">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>{lightningCount} strike{lightningCount > 1 ? 's' : ''} in last 30m</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
