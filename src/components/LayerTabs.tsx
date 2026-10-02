import React from 'react';
import { Wind, Gauge, CloudRain, Zap, Layers, CheckSquare, Square } from 'lucide-react';
import { ActiveLayer, CombinedLayerState } from '../types/weather';

interface LayerTabsProps {
  activeLayer: ActiveLayer;
  onSelectLayer: (layer: ActiveLayer) => void;
  combinedState: CombinedLayerState;
  onUpdateCombinedState: (state: CombinedLayerState) => void;
  isSimulatedDemo: boolean;
  onToggleSimulatedDemo: () => void;
}

export const LayerTabs: React.FC<LayerTabsProps> = ({
  activeLayer,
  onSelectLayer,
  combinedState,
  onUpdateCombinedState,
  isSimulatedDemo,
  onToggleSimulatedDemo,
}) => {
  const tabs = [
    {
      id: 'psi' as ActiveLayer,
      name: '24-hr PSI',
      shortName: 'PSI',
      icon: Gauge,
      description: 'Regional Air Quality Bands',
    },
    {
      id: 'pm25' as ActiveLayer,
      name: '1-hr PM2.5',
      shortName: 'PM2.5',
      icon: Wind,
      description: 'Particulate Matter Readings',
    },
    {
      id: 'rain' as ActiveLayer,
      name: 'Rainfall',
      shortName: 'Rain',
      icon: CloudRain,
      description: '5-Minute Station Totals',
    },
    {
      id: 'lightning' as ActiveLayer,
      name: 'Lightning',
      shortName: 'Lightning',
      icon: Zap,
      description: 'MSS Lightning Detection',
    },
    {
      id: 'combined' as ActiveLayer,
      name: 'Combined',
      shortName: 'Combined',
      icon: Layers,
      description: 'Multi-layer Overlay',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-2 sm:p-3 space-y-2.5">
      {/* Primary Tab Navigation */}
      <div className="flex flex-wrap sm:grid sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-lg">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeLayer === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectLayer(tab.id)}
              className={`flex-1 min-w-[70px] py-2 px-2.5 rounded-md text-xs sm:text-sm font-semibold transition flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive
                    ? 'text-cyan-400'
                    : 'text-slate-500'
                }`}
              />
              <span className="whitespace-nowrap">{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-controls when in "Combined" layer view */}
      {activeLayer === 'combined' && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-cyan-600" />
              Active Overlays in Combined Mode
            </span>
            <span className="text-[11px] text-slate-400">Toggle layers freely</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            {/* Haze Overlay toggle */}
            <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
              <button
                type="button"
                onClick={() =>
                  onUpdateCombinedState({
                    ...combinedState,
                    showHaze: !combinedState.showHaze,
                  })
                }
                className="flex items-center space-x-2 text-xs font-medium text-slate-800 cursor-pointer"
              >
                {combinedState.showHaze ? (
                  <CheckSquare className="w-4 h-4 text-cyan-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>Regional Haze</span>
              </button>

              {/* Metric selector if haze is on */}
              {combinedState.showHaze && (
                <div className="flex rounded border border-slate-300 overflow-hidden text-[10px] font-bold">
                  <button
                    onClick={() =>
                      onUpdateCombinedState({ ...combinedState, hazeMetric: 'psi' })
                    }
                    className={`px-1.5 py-0.5 ${
                      combinedState.hazeMetric === 'psi'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    PSI
                  </button>
                  <button
                    onClick={() =>
                      onUpdateCombinedState({ ...combinedState, hazeMetric: 'pm25' })
                    }
                    className={`px-1.5 py-0.5 ${
                      combinedState.hazeMetric === 'pm25'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    PM2.5
                  </button>
                </div>
              )}
            </div>

            {/* Rain Overlay toggle */}
            <button
              type="button"
              onClick={() =>
                onUpdateCombinedState({
                  ...combinedState,
                  showRain: !combinedState.showRain,
                })
              }
              className="flex items-center space-x-2 p-2 bg-white rounded border border-slate-200 text-xs font-medium text-slate-800 cursor-pointer"
            >
              {combinedState.showRain ? (
                <CheckSquare className="w-4 h-4 text-sky-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Rain Stations</span>
            </button>

            {/* Lightning Overlay toggle */}
            <button
              type="button"
              onClick={() =>
                onUpdateCombinedState({
                  ...combinedState,
                  showLightning: !combinedState.showLightning,
                })
              }
              className="flex items-center space-x-2 p-2 bg-white rounded border border-slate-200 text-xs font-medium text-slate-800 cursor-pointer"
            >
              {combinedState.showLightning ? (
                <CheckSquare className="w-4 h-4 text-amber-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Lightning Strikes</span>
            </button>
          </div>
        </div>
      )}

      {/* Demo Simulation Toggle */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5 border-t border-slate-100 px-1">
        <span className="text-[11px] text-slate-500">
          Showing real-time data from NEA MSS LDS network.
        </span>
        <button
          onClick={onToggleSimulatedDemo}
          className={`px-2 py-0.5 rounded text-[11px] font-medium border transition cursor-pointer ${
            isSimulatedDemo
              ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
          }`}
          title="Toggle sample weather effects to visualize active rain & lightning strikes"
        >
          {isSimulatedDemo ? 'Storm Demo: ON (Click to disable)' : 'Demo storm effects'}
        </button>
      </div>
    </div>
  );
};
