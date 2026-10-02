import React from 'react';
import { RefreshCw, Radio, Wind, AlertCircle, Activity } from 'lucide-react';
import { formatToSGT } from '../utils/advisory';

interface HeaderProps {
  lastUpdated: string | null;
  isLoading: boolean;
  onRefresh: () => void;
  nextRefreshSeconds: number;
  hasError: boolean;
  onOpenHealthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lastUpdated,
  isLoading,
  onRefresh,
  nextRefreshSeconds,
  hasError,
  onOpenHealthModal,
}) => {
  const minutes = Math.floor(nextRefreshSeconds / 60);
  const seconds = nextRefreshSeconds % 60;
  const formattedCountdown = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <header className="bg-[#0B192C] text-white shadow-md border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-inner text-white font-bold">
            <Wind className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center">
                SG Weather &amp; Haze Watch
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                NEA Real-Time
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              24-Hour PSI &bull; 1-Hour PM2.5 &bull; 5-Min Rainfall &bull; Lightning LDS
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* API Health Button */}
          <button
            onClick={onOpenHealthModal}
            title="Inspect API health & upstream latencies"
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition flex items-center space-x-1.5 text-xs font-medium cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">API Health</span>
          </button>

          {/* Live Indicator & Timestamp */}
          <div className="flex flex-col items-end text-right pl-1 sm:pl-2 border-l border-slate-800">
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center">
                <Radio className="w-3 h-3 mr-0.5 inline-block" /> Live
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono mt-0.5">
              {lastUpdated ? formatToSGT(lastUpdated) : 'Updating...'}
            </div>
          </div>

          {/* Auto-refresh timer info (Desktop) */}
          <div className="hidden md:flex flex-col items-end text-xs text-slate-400 border-l border-slate-700 pl-3">
            <span className="text-[11px] text-slate-400">Auto-refresh</span>
            <span className="font-mono text-cyan-300 font-medium">{formattedCountdown}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh now"
            className="p-2 sm:px-3 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 transition flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 cursor-pointer text-xs font-medium"
          >
            <RefreshCw
              className={`w-4 h-4 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {hasError && (
        <div className="bg-amber-600/90 text-white text-xs px-4 py-1.5 text-center flex items-center justify-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Notice: Network request encountered a delay. Displaying latest cached observations.</span>
        </div>
      )}
    </header>
  );
};
