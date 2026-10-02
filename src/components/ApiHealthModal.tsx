import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  ExternalLink,
  ShieldCheck,
  Server,
} from 'lucide-react';
import { ApiHealthReport, getApiHealth } from '../services/healthApi';

interface ApiHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiHealthModal: React.FC<ApiHealthModalProps> = ({ isOpen, onClose }) => {
  const [report, setReport] = useState<ApiHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runCheck = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getApiHealth(true);
      setReport(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to complete API health check');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isHealthy = report?.status === 'healthy';
  const isDegraded = report?.status === 'degraded';

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-cyan-100 text-cyan-800 rounded-lg">
              <Activity className="w-5 h-5 text-cyan-700" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  API &amp; Services Health Check
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-200 text-slate-700">
                  /api/health
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Live connectivity, response latency, and status of NEA &amp; OneMap APIs
              </p>
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs text-slate-700">
          {/* Status Overview Card */}
          {report && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isHealthy
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : isDegraded
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-start sm:items-center space-x-3">
                {isHealthy ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : isDegraded ? (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {isHealthy
                      ? 'All Systems Operational'
                      : isDegraded
                      ? 'Degraded Performance Observed'
                      : 'Upstream Outage Detected'}
                  </div>
                  <div className="text-xs opacity-90 mt-0.5">
                    {isHealthy
                      ? `All ${report.summary?.totalServices || 6} upstream government data feeds are responding promptly.`
                      : 'One or more upstream government services experienced latency or errors.'}
                  </div>
                </div>
              </div>

              {/* Server Uptime & SGT stamp */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-current/20 text-[11px] shrink-0 font-medium">
                <span className="flex items-center space-x-1">
                  <Server className="w-3.5 h-3.5 opacity-70" />
                  <span>Uptime: {formatUptime(report.uptimeSeconds)}</span>
                </span>
                <span className="flex items-center space-x-1 mt-0.5 font-mono">
                  <Clock className="w-3 h-3 opacity-70" />
                  <span>{report.sgtTime}</span>
                </span>
              </div>
            </div>
          )}

          {/* Quick Metrics Bar */}
          {report?.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  Total Services
                </div>
                <div className="text-xl font-bold text-slate-800 mt-1">
                  {report.summary.totalServices}
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-center">
                <div className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                  Operational
                </div>
                <div className="text-xl font-bold text-emerald-700 mt-1">
                  {report.summary.upServices}
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-center">
                <div className="text-[10px] text-amber-700 font-semibold uppercase tracking-wider">
                  Degraded / Slow
                </div>
                <div className="text-xl font-bold text-amber-700 mt-1">
                  {report.summary.degradedServices}
                </div>
              </div>

              <div className="p-3 bg-sky-50/60 border border-sky-200 rounded-lg text-center">
                <div className="text-[10px] text-sky-700 font-semibold uppercase tracking-wider">
                  Avg Latency
                </div>
                <div className="text-xl font-bold text-sky-800 mt-1">
                  {report.summary.averageLatencyMs} <span className="text-xs font-normal">ms</span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Service Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-xs flex items-center justify-between">
              <span>Monitored Government &amp; Basemap Feeds</span>
              <span className="text-[11px] font-normal text-slate-500">Live Ping</span>
            </div>

            <div className="divide-y divide-slate-100">
              {report?.services?.map((svc) => {
                const isUp = svc.status === 'up';
                const isDeg = svc.status === 'degraded';
                return (
                  <div
                    key={svc.id}
                    className="p-3 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 text-xs">{svc.name}</span>
                        {svc.httpCode && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                            HTTP {svc.httpCode}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-sm mt-0.5">
                        {svc.url}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
                      {/* Latency badge */}
                      <span
                        className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold ${
                          svc.latencyMs < 500
                            ? 'bg-slate-100 text-slate-700'
                            : svc.latencyMs < 1500
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {svc.latencyMs} ms
                      </span>

                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isUp
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDeg
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isUp ? (
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        ) : isDeg ? (
                          <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1 text-rose-600" />
                        )}
                        <span className="capitalize">{svc.status}</span>
                      </span>
                    </div>
                  </div>
                );
              })}

              {!report && isLoading && (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-600" />
                  <p>Pinging all NEA real-time endpoints and measuring roundtrip latencies...</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-rose-50 text-rose-700 text-center font-medium">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Direct API Endpoint Info */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800">Direct Health Endpoint</div>
              <p className="text-[11px] text-slate-500">
                You can curl or query <code className="text-cyan-700 font-mono">/api/health</code> or{' '}
                <code className="text-cyan-700 font-mono">/api/health?detailed=true</code> for automated uptime monitors.
              </p>
            </div>
            <a
              href="/api/health?detailed=true"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 bg-white border border-slate-300 text-slate-700 hover:text-slate-900 rounded-md font-medium text-[11px] flex items-center space-x-1 shrink-0"
            >
              <span>View JSON</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>MSS LDS &amp; NEA Data Status</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={runCheck}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md font-semibold text-xs transition cursor-pointer flex items-center space-x-1 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-check Now</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-semibold text-xs transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
