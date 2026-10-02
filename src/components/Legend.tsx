import React from 'react';
import { ActiveLayer } from '../types/weather';
import { Info, Gauge, Wind, CloudRain, Zap } from 'lucide-react';

interface LegendProps {
  activeLayer: ActiveLayer;
}

export const Legend: React.FC<LegendProps> = ({ activeLayer }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
          <Info className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
          Map Legend &amp; Bands
        </h3>
        <span className="text-[11px] text-slate-400">NEA Standards</span>
      </div>

      {/* PSI Legend (Active if PSI or Combined) */}
      {(activeLayer === 'psi' || activeLayer === 'combined') && (
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
            <Gauge className="w-3.5 h-3.5 text-slate-500" />
            <span>24-Hour PSI (Pollutant Standards Index)</span>
          </div>
          <div className="grid grid-cols-5 gap-1 text-center">
            <div className="p-1 rounded bg-emerald-50 border border-emerald-200">
              <div className="w-full h-2 rounded bg-[#10B981] mb-1"></div>
              <div className="text-[11px] font-bold text-emerald-800">Good</div>
              <div className="text-[10px] text-emerald-700 font-mono">0–50</div>
            </div>
            <div className="p-1 rounded bg-sky-50 border border-sky-200">
              <div className="w-full h-2 rounded bg-[#0284C7] mb-1"></div>
              <div className="text-[11px] font-bold text-sky-800">Moderate</div>
              <div className="text-[10px] text-sky-700 font-mono">51–100</div>
            </div>
            <div className="p-1 rounded bg-amber-50 border border-amber-200">
              <div className="w-full h-2 rounded bg-[#D97706] mb-1"></div>
              <div className="text-[11px] font-bold text-amber-800">Unhealthy</div>
              <div className="text-[10px] text-amber-700 font-mono">101–200</div>
            </div>
            <div className="p-1 rounded bg-red-50 border border-red-200">
              <div className="w-full h-2 rounded bg-[#DC2626] mb-1"></div>
              <div className="text-[11px] font-bold text-red-800">Very Unh.</div>
              <div className="text-[10px] text-red-700 font-mono">201–300</div>
            </div>
            <div className="p-1 rounded bg-rose-50 border border-rose-200">
              <div className="w-full h-2 rounded bg-[#881337] mb-1"></div>
              <div className="text-[11px] font-bold text-rose-950">Hazardous</div>
              <div className="text-[10px] text-rose-900 font-mono">301+</div>
            </div>
          </div>
        </div>
      )}

      {/* PM2.5 Legend (Active if PM2.5 or Combined) */}
      {(activeLayer === 'pm25' || activeLayer === 'combined') && (
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
            <Wind className="w-3.5 h-3.5 text-slate-500" />
            <span>1-Hour PM2.5 Concentration (µg/m³)</span>
          </div>
          <div className="grid grid-cols-4 gap-1 text-center">
            <div className="p-1 rounded bg-emerald-50 border border-emerald-200">
              <div className="w-full h-2 rounded bg-[#10B981] mb-1"></div>
              <div className="text-[11px] font-bold text-emerald-800">Band I Normal</div>
              <div className="text-[10px] text-emerald-700 font-mono">0–55</div>
            </div>
            <div className="p-1 rounded bg-sky-50 border border-sky-200">
              <div className="w-full h-2 rounded bg-[#0284C7] mb-1"></div>
              <div className="text-[11px] font-bold text-sky-800">Band II Elev.</div>
              <div className="text-[10px] text-sky-700 font-mono">56–150</div>
            </div>
            <div className="p-1 rounded bg-amber-50 border border-amber-200">
              <div className="w-full h-2 rounded bg-[#D97706] mb-1"></div>
              <div className="text-[11px] font-bold text-amber-800">Band III High</div>
              <div className="text-[10px] text-amber-700 font-mono">151–250</div>
            </div>
            <div className="p-1 rounded bg-red-50 border border-red-200">
              <div className="w-full h-2 rounded bg-[#DC2626] mb-1"></div>
              <div className="text-[11px] font-bold text-red-800">Band IV V.High</div>
              <div className="text-[10px] text-red-700 font-mono">251+</div>
            </div>
          </div>
        </div>
      )}

      {/* Rainfall Legend */}
      {(activeLayer === 'rain' || activeLayer === 'combined') && (
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
            <CloudRain className="w-3.5 h-3.5 text-sky-600" />
            <span>Rainfall Stations (5-Minute Total)</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
            <div className="flex flex-col items-center p-1 bg-slate-50 rounded border border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 mb-0.5"></span>
              <span className="font-semibold text-slate-700">No Rain</span>
              <span className="text-slate-400">0.0 mm</span>
            </div>
            <div className="flex flex-col items-center p-1 bg-sky-50 rounded border border-sky-200">
              <span className="w-3.5 h-3.5 rounded-full bg-sky-500 mb-0.5"></span>
              <span className="font-semibold text-sky-800">Light</span>
              <span className="text-sky-600 font-mono">0.1–2.0 mm</span>
            </div>
            <div className="flex flex-col items-center p-1 bg-blue-50 rounded border border-blue-200">
              <span className="w-4 h-4 rounded-full bg-blue-600 mb-0.5"></span>
              <span className="font-semibold text-blue-800">Moderate</span>
              <span className="text-blue-600 font-mono">2.1–5.0 mm</span>
            </div>
            <div className="flex flex-col items-center p-1 bg-purple-50 rounded border border-purple-200">
              <span className="w-5 h-5 rounded-full bg-purple-700 mb-0.5"></span>
              <span className="font-semibold text-purple-900">Heavy</span>
              <span className="text-purple-700 font-mono">&gt; 5.0 mm</span>
            </div>
          </div>
        </div>
      )}

      {/* Lightning Recency Legend */}
      {(activeLayer === 'lightning' || activeLayer === 'combined') && (
        <div className="space-y-1.5 pt-1">
          <div className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>MSS Lightning Detection System (LDS)</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            <div className="flex items-center space-x-1.5 p-1 bg-amber-50 rounded border border-amber-200 justify-center">
              <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500 ring-2 ring-amber-300"></span>
              <span className="font-semibold text-amber-900">&lt; 10 mins (Fresh)</span>
            </div>
            <div className="flex items-center space-x-1.5 p-1 bg-amber-50/60 rounded border border-amber-200 justify-center">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="font-medium text-amber-800">10–20 mins</span>
            </div>
            <div className="flex items-center space-x-1.5 p-1 bg-slate-50 rounded border border-slate-200 justify-center">
              <span className="w-3 h-3 rounded-full bg-amber-700/60"></span>
              <span className="text-slate-600">20–30 mins (Fading)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
