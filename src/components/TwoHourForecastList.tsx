import React, { useState } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { TwoHourForecastData } from '../types/weather';

interface TwoHourForecastListProps {
  forecastData: TwoHourForecastData | null;
}

export const TwoHourForecastList: React.FC<TwoHourForecastListProps> = ({ forecastData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!forecastData || forecastData.forecasts.length === 0) {
    return null;
  }

  const filteredForecasts = forecastData.forecasts.filter(f =>
    f.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWeatherIcon = (forecast: string) => {
    const lower = forecast.toLowerCase();
    if (lower.includes('thunder') || lower.includes('lightning')) {
      return <CloudLightning className="w-4 h-4 text-amber-500 shrink-0" />;
    }
    if (lower.includes('rain') || lower.includes('shower')) {
      return <CloudRain className="w-4 h-4 text-sky-500 shrink-0" />;
    }
    if (lower.includes('cloud')) {
      return <Cloud className="w-4 h-4 text-slate-400 shrink-0" />;
    }
    return <Sun className="w-4 h-4 text-amber-400 shrink-0" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header with expand toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 border-b border-slate-200 flex items-center justify-between transition cursor-pointer text-left"
      >
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2-Hour Area Weather Forecast
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-medium">
              {forecastData.validPeriod.text || 'Valid 2 Hours'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            NEA local forecast across 47 Singapore planning areas
          </p>
        </div>
        <div className="flex items-center space-x-1 text-slate-500">
          <span className="text-xs hidden sm:inline">{isExpanded ? 'Hide' : 'Show All'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search area (e.g., Bedok, Woodlands, Tampines)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Grid of Areas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-60 overflow-y-auto pr-1">
            {filteredForecasts.map(item => (
              <div
                key={item.area}
                className="p-2 rounded bg-slate-50/80 border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-100 transition"
              >
                <span className="font-medium text-slate-800 truncate mr-2">{item.area}</span>
                <div className="flex items-center space-x-1 shrink-0">
                  {getWeatherIcon(item.forecast)}
                  <span className="text-[11px] text-slate-600 hidden md:inline truncate max-w-[80px]">
                    {item.forecast}
                  </span>
                </div>
              </div>
            ))}
            {filteredForecasts.length === 0 && (
              <div className="col-span-full py-4 text-center text-xs text-slate-400">
                No matching area found for "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
