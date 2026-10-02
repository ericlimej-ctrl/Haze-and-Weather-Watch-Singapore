import React from 'react';
import { X, HeartPulse, ShieldAlert, Clock, Gauge, Wind, AlertCircle } from 'lucide-react';
import { RegionSummaryInfo } from '../types/weather';
import { formatFullSGT } from '../utils/advisory';

interface RegionModalProps {
  region: RegionSummaryInfo | null;
  onClose: () => void;
}

export const RegionModal: React.FC<RegionModalProps> = ({ region, onClose }) => {
  if (!region) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-slate-900">
                {region.name} Region
              </h3>
              <span className="text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider text-slate-700 bg-slate-200">
                Singapore
              </span>
            </div>
            <div className="flex items-center text-xs text-slate-500 mt-0.5 space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Reading: {formatFullSGT(region.lastUpdated)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Main Air Quality Score Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* 24-hr PSI Card */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 flex items-center">
                  <Gauge className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  24-Hour PSI
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: region.psiBand.color }}
                />
              </div>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {region.psi24}
                </span>
              </div>
              <div>
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: region.psiBand.color }}
                >
                  {region.psiBand.band}
                </span>
              </div>
            </div>

            {/* 1-hr PM2.5 Card */}
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 flex items-center">
                  <Wind className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  1-Hour PM2.5
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: region.pm25Band.color }}
                />
              </div>
              <div className="my-2">
                <span className="text-3xl font-extrabold text-slate-900">
                  {region.pm25_1hr}
                </span>
                <span className="text-xs text-slate-500 ml-1 font-medium">µg/m³</span>
              </div>
              <div>
                <span
                  className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: region.pm25Band.color }}
                >
                  {region.pm25Band.shortBand}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-Pollutants breakdown */}
          {region.additionalReadings && (
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Additional Pollutant Readings
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-semibold">24h PM10</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">
                    {region.additionalReadings.pm10 ?? 'N/A'}
                  </div>
                  <div className="text-[9px] text-slate-400">µg/m³</div>
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-semibold">1h Max NO₂</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">
                    {region.additionalReadings.no2 ?? 'N/A'}
                  </div>
                  <div className="text-[9px] text-slate-400">µg/m³</div>
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-semibold">24h SO₂</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">
                    {region.additionalReadings.so2 ?? 'N/A'}
                  </div>
                  <div className="text-[9px] text-slate-400">µg/m³</div>
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-semibold">8h Max CO</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">
                    {region.additionalReadings.co ?? 'N/A'}
                  </div>
                  <div className="text-[9px] text-slate-400">mg/m³</div>
                </div>
                <div className="p-1.5 bg-white rounded border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-semibold">8h Max O₃</div>
                  <div className="font-bold text-slate-800 text-sm mt-0.5">
                    {region.additionalReadings.o3 ?? 'N/A'}
                  </div>
                  <div className="text-[9px] text-slate-400">µg/m³</div>
                </div>
              </div>
            </div>
          )}

          {/* Official NEA Health Advisory Section */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <HeartPulse className="w-4 h-4 mr-1.5 text-blue-600" />
              Official NEA Health Advisories
            </h4>

            {/* General Population Advisory */}
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-lg space-y-1">
              <div className="text-xs font-bold text-blue-900 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5"></span>
                Healthy Individuals
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                {region.psiBand.generalAdvice}
              </p>
            </div>

            {/* Vulnerable Groups Advisory */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
              <div className="text-xs font-bold text-amber-900 flex items-center">
                <ShieldAlert className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                Vulnerable Persons (Elderly, Pregnant, Children, Lung/Heart Conditions)
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {region.psiBand.vulnerableAdvice}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Source: National Environment Agency</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
