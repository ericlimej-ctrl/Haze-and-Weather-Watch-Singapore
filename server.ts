import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// List of upstream external endpoints to monitor
const UPSTREAM_SERVICES = [
  {
    id: 'psi',
    name: 'NEA 24-hr PSI API',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/psi',
    type: 'json',
  },
  {
    id: 'pm25',
    name: 'NEA 1-hr PM2.5 API',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/pm25',
    type: 'json',
  },
  {
    id: 'rainfall',
    name: 'NEA 5-min Rainfall API',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/rainfall',
    type: 'json',
  },
  {
    id: 'lightning',
    name: 'MSS Lightning Detection API',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/weather?api=lightning',
    type: 'json',
  },
  {
    id: 'forecast',
    name: 'NEA 2-hr Weather Forecast API',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast',
    type: 'json',
  },
  {
    id: 'onemap',
    name: 'OneMap Singapore Basemap Tiles',
    url: 'https://www.onemap.gov.sg/maps/tiles/Default/11/1654/1018.png',
    type: 'image',
  },
];

interface ServiceCheckResult {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'down' | 'degraded';
  httpCode: number | null;
  latencyMs: number;
  message?: string;
}

// Function to test an individual upstream service
async function checkService(svc: typeof UPSTREAM_SERVICES[0]): Promise<ServiceCheckResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const res = await fetch(svc.url, {
      method: 'GET',
      headers: {
        Accept: svc.type === 'json' ? 'application/json' : 'image/png,*/*',
        'User-Agent': 'SGWeatherHazeWatch-HealthCheck/1.0',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;

    const isOk = res.ok;
    const isDegraded = latencyMs > 2500;

    return {
      id: svc.id,
      name: svc.name,
      url: svc.url,
      status: isOk ? (isDegraded ? 'degraded' : 'up') : 'down',
      httpCode: res.status,
      latencyMs,
      message: isOk ? 'OK' : `HTTP error ${res.status}`,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;
    const isAbort = err.name === 'AbortError';

    return {
      id: svc.id,
      name: svc.name,
      url: svc.url,
      status: 'down',
      httpCode: null,
      latencyMs,
      message: isAbort ? 'Request timed out (>6000ms)' : (err.message || 'Connection failed'),
    };
  }
}

/**
 * GET /api/health
 * Fast health check or detailed diagnostic check (?detailed=true)
 */
app.get('/api/health', async (req, res) => {
  const isDetailed = req.query.detailed === 'true' || req.query.check === 'all';
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

  if (!isDetailed) {
    return res.status(200).json({
      status: 'healthy',
      app: 'SG Weather & Haze Watch API',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: now.toISOString(),
      sgtTime: sgtString,
      version: '1.0.0',
      endpoints: {
        detailedCheck: '/api/health?detailed=true',
      },
    });
  }

  // Run detailed diagnostic checks across all upstream dependencies
  const results = await Promise.all(UPSTREAM_SERVICES.map(checkService));
  const downCount = results.filter(r => r.status === 'down').length;
  const degradedCount = results.filter(r => r.status === 'degraded').length;

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  let httpStatusCode = 200;

  if (downCount > 2) {
    overallStatus = 'unhealthy';
    httpStatusCode = 503;
  } else if (downCount > 0 || degradedCount > 0) {
    overallStatus = 'degraded';
    httpStatusCode = 200;
  }

  const avgLatency = Math.round(
    results.reduce((acc, r) => acc + r.latencyMs, 0) / results.length
  );

  return res.status(httpStatusCode).json({
    status: overallStatus,
    app: 'SG Weather & Haze Watch API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: now.toISOString(),
    sgtTime: sgtString,
    summary: {
      totalServices: UPSTREAM_SERVICES.length,
      upServices: results.filter(r => r.status === 'up').length,
      degradedServices: degradedCount,
      downServices: downCount,
      averageLatencyMs: avgLatency,
    },
    services: results,
  });
});

/**
 * GET /api/health/detailed
 * Direct route for full diagnostic check
 */
app.get('/api/health/detailed', async (req, res) => {
  req.query.detailed = 'true';
  // Forward to /api/health handler
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

  const results = await Promise.all(UPSTREAM_SERVICES.map(checkService));
  const downCount = results.filter(r => r.status === 'down').length;
  const degradedCount = results.filter(r => r.status === 'degraded').length;

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  let httpStatusCode = 200;

  if (downCount > 2) {
    overallStatus = 'unhealthy';
    httpStatusCode = 503;
  } else if (downCount > 0 || degradedCount > 0) {
    overallStatus = 'degraded';
    httpStatusCode = 200;
  }

  const avgLatency = Math.round(
    results.reduce((acc, r) => acc + r.latencyMs, 0) / results.length
  );

  return res.status(httpStatusCode).json({
    status: overallStatus,
    app: 'SG Weather & Haze Watch API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: now.toISOString(),
    sgtTime: sgtString,
    summary: {
      totalServices: UPSTREAM_SERVICES.length,
      upServices: results.filter(r => r.status === 'up').length,
      degradedServices: degradedCount,
      downServices: downCount,
      averageLatencyMs: avgLatency,
    },
    services: results,
  });
});

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`API Health Check available at http://localhost:${PORT}/api/health`);
  });
}

startServer();
