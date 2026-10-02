/**
 * API Health Check Client Service
 */

export interface ServiceHealthItem {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'down' | 'degraded';
  httpCode: number | null;
  latencyMs: number;
  message?: string;
}

export interface ApiHealthReport {
  status: 'healthy' | 'degraded' | 'unhealthy';
  app: string;
  uptimeSeconds: number;
  timestamp: string;
  sgtTime: string;
  summary?: {
    totalServices: number;
    upServices: number;
    degradedServices: number;
    downServices: number;
    averageLatencyMs: number;
  };
  services?: ServiceHealthItem[];
}

/**
 * Call server-side /api/health
 */
export async function getApiHealth(detailed = false): Promise<ApiHealthReport> {
  const url = detailed ? '/api/health?detailed=true' : '/api/health';
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    return await res.json();
  } catch (err) {
    // If backend route call fails, run client-side direct ping
    return await runClientDirectHealthCheck();
  }
}

/**
 * Client-side direct fallback check if running in static mode
 */
export async function runClientDirectHealthCheck(): Promise<ApiHealthReport> {
  const services = [
    { id: 'psi', name: 'NEA 24-hr PSI API', url: 'https://api-open.data.gov.sg/v2/real-time/api/psi' },
    { id: 'pm25', name: 'NEA 1-hr PM2.5 API', url: 'https://api-open.data.gov.sg/v2/real-time/api/pm25' },
    { id: 'rainfall', name: 'NEA 5-min Rainfall API', url: 'https://api-open.data.gov.sg/v2/real-time/api/rainfall' },
    { id: 'lightning', name: 'MSS Lightning Detection API', url: 'https://api-open.data.gov.sg/v2/real-time/api/weather?api=lightning' },
    { id: 'forecast', name: 'NEA 2-hr Weather Forecast API', url: 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast' },
    { id: 'onemap', name: 'OneMap Singapore Basemap Tiles', url: 'https://www.onemap.gov.sg/maps/tiles/Default/11/1654/1018.png' },
  ];

  const results: ServiceHealthItem[] = await Promise.all(
    services.map(async (svc) => {
      const start = performance.now();
      try {
        const res = await fetch(svc.url, { method: 'GET' });
        const latencyMs = Math.round(performance.now() - start);
        return {
          id: svc.id,
          name: svc.name,
          url: svc.url,
          status: res.ok ? (latencyMs > 2500 ? 'degraded' : 'up') : 'down',
          httpCode: res.status,
          latencyMs,
          message: res.ok ? 'OK' : `HTTP ${res.status}`,
        };
      } catch (e: any) {
        const latencyMs = Math.round(performance.now() - start);
        return {
          id: svc.id,
          name: svc.name,
          url: svc.url,
          status: 'down',
          httpCode: null,
          latencyMs,
          message: e.message || 'Network error',
        };
      }
    })
  );

  const downCount = results.filter(r => r.status === 'down').length;
  const degradedCount = results.filter(r => r.status === 'degraded').length;

  const now = new Date();
  const sgtString = now.toLocaleDateString('en-SG', {
    timeZone: 'Asia/Singapore',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }) + ' SGT';

  return {
    status: downCount > 2 ? 'unhealthy' : downCount > 0 || degradedCount > 0 ? 'degraded' : 'healthy',
    app: 'SG Weather & Haze Watch Client Health',
    uptimeSeconds: Math.round(performance.now() / 1000),
    timestamp: now.toISOString(),
    sgtTime: sgtString,
    summary: {
      totalServices: services.length,
      upServices: results.filter(r => r.status === 'up').length,
      degradedServices: degradedCount,
      downServices: downCount,
      averageLatencyMs: Math.round(results.reduce((a, b) => a + b.latencyMs, 0) / results.length),
    },
    services: results,
  };
}
