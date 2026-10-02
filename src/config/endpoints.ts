/**
 * Singapore Weather & Haze Watch - API & Map Configuration
 * All endpoint URLs and coordinates are maintained here for easy updating.
 */

export const CONFIG = {
  appName: 'SG Weather & Haze Watch',
  
  // Real-time NEA APIs via data.gov.sg
  endpoints: {
    // 24-hour PSI by region
    psi: 'https://api-open.data.gov.sg/v2/real-time/api/psi',
    
    // 1-hour PM2.5 by region
    pm25: 'https://api-open.data.gov.sg/v2/real-time/api/pm25',
    
    // 5-minute rainfall readings by station
    rainfall: 'https://api-open.data.gov.sg/v2/real-time/api/rainfall',
    
    // Lightning observations (with working query parameter fallback)
    lightning: 'https://api-open.data.gov.sg/v2/real-time/api/lightning',
    lightningFallback: 'https://api-open.data.gov.sg/v2/real-time/api/weather?api=lightning',
    
    // 2-hour weather forecast by planning area
    twoHourForecast: 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast',

    // API Health Check endpoints
    health: '/api/health',
    healthDetailed: '/api/health?detailed=true',
  },

  // Map Basemaps
  map: {
    // Centre of Singapore
    center: [1.3521, 103.8198] as [number, number],
    defaultZoom: 11,
    minZoom: 10,
    maxZoom: 17,
    
    // Singapore geographical boundary bounds
    bounds: [
      [1.13, 103.57], // South-West
      [1.485, 104.10], // North-East
    ] as [[number, number], [number, number]],

    // Primary basemap: OneMap Singapore (SLA)
    oneMapTileUrl: 'https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png',
    oneMapAttribution: '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a> &copy; Singapore Land Authority',
    
    // Fallback basemap: OpenStreetMap
    osmTileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    osmAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  },

  // Timing
  cacheDurationMs: 90 * 1000, // 90 seconds in-memory cache to avoid rate limits
  autoRefreshIntervalMs: 5 * 60 * 1000, // 5 minutes auto-refresh as requested
};
