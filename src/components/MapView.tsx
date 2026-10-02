import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CONFIG } from '../config/endpoints';
import { SINGAPORE_REGIONS_GEOJSON } from '../data/regionsGeoJson';
import {
  ActiveLayer,
  CombinedLayerState,
  RegionId,
  RegionSummaryInfo,
  RainfallData,
  LightningData,
  LightningStrike,
} from '../types/weather';
import { getRainBand } from '../utils/advisory';
import { Locate, RotateCcw, MapPin, Eye } from 'lucide-react';

interface MapViewProps {
  activeLayer: ActiveLayer;
  combinedState: CombinedLayerState;
  regionSummaries: RegionSummaryInfo[];
  rainfallData: RainfallData | null;
  lightningData: LightningData | null;
  selectedRegionId: RegionId | null;
  onSelectRegion: (id: RegionId) => void;
  isSimulatedDemo?: boolean;
}

export const MapView: React.FC<MapViewProps> = ({
  activeLayer,
  combinedState,
  regionSummaries,
  rainfallData,
  lightningData,
  selectedRegionId,
  onSelectRegion,
  isSimulatedDemo = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // Layer groups to manage dynamic updates
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const labelsLayerRef = useRef<L.LayerGroup | null>(null);
  const rainfallLayerRef = useRef<L.LayerGroup | null>(null);
  const lightningLayerRef = useRef<L.LayerGroup | null>(null);

  const [usingOsmFallback, setUsingOsmFallback] = useState(false);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const bounds = L.latLngBounds(CONFIG.map.bounds[0], CONFIG.map.bounds[1]);

    const map = L.map(mapContainerRef.current, {
      center: CONFIG.map.center,
      zoom: CONFIG.map.defaultZoom,
      minZoom: CONFIG.map.minZoom,
      maxZoom: CONFIG.map.maxZoom,
      maxBounds: bounds,
      maxBoundsViscosity: 0.9,
      zoomControl: false,
      attributionControl: true,
    });

    // Custom positioned zoom control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Initial Base Tile Layer (OneMap with OSM fallback on error)
    const oneMapLayer = L.tileLayer(CONFIG.map.oneMapTileUrl, {
      attribution: CONFIG.map.oneMapAttribution,
      maxZoom: 18,
      minZoom: 10,
    });

    // If OneMap fails to load tiles, smoothly switch to OpenStreetMap
    let hasFallbackFired = false;
    oneMapLayer.on('tileerror', () => {
      if (!hasFallbackFired) {
        hasFallbackFired = true;
        console.warn('OneMap tile failed, falling back to OpenStreetMap tiles');
        setUsingOsmFallback(true);
        if (map.hasLayer(oneMapLayer)) {
          map.removeLayer(oneMapLayer);
        }
        const osmLayer = L.tileLayer(CONFIG.map.osmTileUrl, {
          attribution: CONFIG.map.osmAttribution,
          maxZoom: 18,
          minZoom: 10,
        }).addTo(map);
        baseTileLayerRef.current = osmLayer;
      }
    });

    oneMapLayer.addTo(map);
    baseTileLayerRef.current = oneMapLayer;

    // Create container layer groups
    labelsLayerRef.current = L.layerGroup().addTo(map);
    rainfallLayerRef.current = L.layerGroup().addTo(map);
    lightningLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Regions Polygon & Badge Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Check if haze layer should be visible
    const showHaze =
      activeLayer === 'psi' ||
      activeLayer === 'pm25' ||
      (activeLayer === 'combined' && combinedState.showHaze);

    const hazeMetric =
      activeLayer === 'psi'
        ? 'psi'
        : activeLayer === 'pm25'
        ? 'pm25'
        : combinedState.hazeMetric;

    // Remove existing GeoJSON and labels
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }
    if (labelsLayerRef.current) {
      labelsLayerRef.current.clearLayers();
    }

    if (!showHaze) return;

    // Region lookup map
    const regionMap = new Map<RegionId, RegionSummaryInfo>();
    regionSummaries.forEach(r => regionMap.set(r.id, r));

    // Style function for region polygons
    const getFeatureStyle = (feature: any) => {
      const regionId = feature?.properties?.id as RegionId;
      const data = regionMap.get(regionId);
      const isSelected = selectedRegionId === regionId;

      let color = '#3B82F6';
      let fillOpacity = 0.45;

      if (data) {
        if (hazeMetric === 'psi') {
          color = data.psiBand.color;
        } else {
          color = data.pm25Band.color;
        }
      }

      return {
        color: isSelected ? '#0F172A' : color,
        weight: isSelected ? 3.5 : 2,
        fillColor: color,
        fillOpacity: isSelected ? 0.65 : fillOpacity,
        dashArray: isSelected ? '' : '2 4',
      };
    };

    // Create GeoJSON layer
    const geoLayer = L.geoJSON(SINGAPORE_REGIONS_GEOJSON as any, {
      style: getFeatureStyle,
      onEachFeature: (feature, layer) => {
        const regionId = feature.properties.id as RegionId;
        const data = regionMap.get(regionId);

        layer.on({
          click: () => {
            onSelectRegion(regionId);
          },
          mouseover: (e) => {
            const target = e.target;
            target.setStyle({
              weight: 3,
              fillOpacity: 0.6,
            });
            target.bringToFront();
          },
          mouseout: (e) => {
            geoLayer.resetStyle(e.target);
          },
        });

        // Add small badges on region centers
        if (data && labelsLayerRef.current) {
          const center = feature.properties.center;
          const displayVal = hazeMetric === 'psi' ? data.psi24 : data.pm25_1hr;
          const displayUnit = hazeMetric === 'psi' ? 'PSI' : 'µg/m³';
          const bandLabel = hazeMetric === 'psi' ? data.psiBand.band : data.pm25Band.shortBand;
          const badgeBg = hazeMetric === 'psi' ? data.psiBand.color : data.pm25Band.color;

          const badgeIcon = L.divIcon({
            className: 'custom-region-badge',
            html: `
              <div class="px-2 py-1 bg-white/95 rounded-md shadow-md border border-slate-300 text-center font-sans whitespace-nowrap transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition hover:scale-105 hover:shadow-lg">
                <div class="text-[11px] font-bold text-slate-800 tracking-tight">${feature.properties.name}</div>
                <div class="flex items-center justify-center space-x-1 mt-0.5">
                  <span class="w-2 h-2 rounded-full inline-block" style="background-color: ${badgeBg}"></span>
                  <span class="text-xs font-extrabold text-slate-900">${displayVal}</span>
                  <span class="text-[10px] text-slate-500 font-medium">${displayUnit}</span>
                </div>
                <div class="text-[9px] font-semibold text-slate-600">${bandLabel}</div>
              </div>
            `,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          });

          const marker = L.marker(center, { icon: badgeIcon, interactive: true });
          marker.on('click', () => onSelectRegion(regionId));
          labelsLayerRef.current.addLayer(marker);
        }
      },
    });

    geoLayer.addTo(map);
    geoJsonLayerRef.current = geoLayer;
  }, [activeLayer, combinedState, regionSummaries, selectedRegionId, onSelectRegion]);

  // Update Rainfall Stations Layer
  useEffect(() => {
    const rainfallGroup = rainfallLayerRef.current;
    if (!rainfallGroup) return;

    rainfallGroup.clearLayers();

    const showRain =
      activeLayer === 'rain' ||
      (activeLayer === 'combined' && combinedState.showRain);

    if (!showRain || !rainfallData) return;

    // Build value map for quick lookup
    const readingMap = new Map<string, number>();
    rainfallData.readings.forEach(r => readingMap.set(r.stationId, r.value));

    // Optional demo storm simulation values
    const getStationValue = (stationId: string): number => {
      if (isSimulatedDemo) {
        // Deterministic simulation distribution across SG
        const hash = stationId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        if (hash % 5 === 0) return 6.8; // heavy
        if (hash % 3 === 0) return 2.4; // moderate
        if (hash % 2 === 0) return 0.8; // light
        return 0;
      }
      return readingMap.get(stationId) ?? 0;
    };

    rainfallData.stations.forEach(station => {
      const lat = station.location?.latitude;
      const lng = station.location?.longitude;
      if (!lat || !lng) return;

      const rainVal = getStationValue(station.id);
      const band = getRainBand(rainVal);

      // Rainfall station circle marker
      const circle = L.circleMarker([lat, lng], {
        radius: band.radius,
        color: band.color,
        weight: rainVal > 0 ? 2 : 1,
        fillColor: band.fillColor,
        fillOpacity: rainVal > 0 ? 0.85 : 0.45,
      });

      // Interactive popup
      circle.bindPopup(`
        <div class="p-1 font-sans text-xs">
          <div class="font-bold text-slate-900">${station.name}</div>
          <div class="text-[11px] text-slate-500">Station ID: ${station.id}</div>
          <div class="mt-1.5 flex items-center justify-between border-t border-slate-100 pt-1">
            <span class="text-slate-600">5-min Total:</span>
            <span class="font-bold text-sm ${rainVal > 0 ? 'text-blue-600' : 'text-slate-700'}">
              ${rainVal.toFixed(1)} mm
            </span>
          </div>
          <div class="text-[10px] text-slate-500 mt-0.5 font-medium">${band.label}</div>
        </div>
      `);

      rainfallGroup.addLayer(circle);

      // If station has active precipitation, add an animated pulse halo
      if (rainVal > 0) {
        const pulse = L.circleMarker([lat, lng], {
          radius: band.radius + 6,
          color: band.fillColor,
          weight: 1,
          fillColor: band.fillColor,
          fillOpacity: 0.25,
          className: 'rain-pulse-halo',
        });
        rainfallGroup.addLayer(pulse);
      }
    });
  }, [activeLayer, combinedState, rainfallData, isSimulatedDemo]);

  // Update Lightning Strikes Layer
  useEffect(() => {
    const lightningGroup = lightningLayerRef.current;
    if (!lightningGroup) return;

    lightningGroup.clearLayers();

    const showLightning =
      activeLayer === 'lightning' ||
      (activeLayer === 'combined' && combinedState.showLightning);

    if (!showLightning) return;

    let strikesToRender: LightningStrike[] = lightningData?.strikes || [];

    // If simulated demo is toggled and no real strikes, show realistic sample strikes
    if (isSimulatedDemo && strikesToRender.length === 0) {
      strikesToRender = [
        {
          id: 'sim-1',
          location: { latitude: 1.378, longitude: 103.73 },
          type: 'G',
          text: 'Cloud to Ground (Demo)',
          datetime: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
          ageMinutes: 3,
        },
        {
          id: 'sim-2',
          location: { latitude: 1.345, longitude: 103.85 },
          type: 'C',
          text: 'Cloud to Cloud (Demo)',
          datetime: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          ageMinutes: 8,
        },
        {
          id: 'sim-3',
          location: { latitude: 1.392, longitude: 103.88 },
          type: 'G',
          text: 'Cloud to Ground (Demo)',
          datetime: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
          ageMinutes: 14,
        },
        {
          id: 'sim-4',
          location: { latitude: 1.31, longitude: 103.78 },
          type: 'C',
          text: 'Cloud to Cloud (Demo)',
          datetime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          ageMinutes: 25,
        },
      ];
    }

    strikesToRender.forEach(strike => {
      const lat = strike.location?.latitude;
      const lng = strike.location?.longitude;
      if (!lat || !lng) return;

      const age = strike.ageMinutes ?? 0;
      // Newer strikes (<10m) bright yellow, 10-20m amber, 20-30m darker/faded
      const isVeryRecent = age <= 10;
      const isRecent = age <= 20;

      const iconColor = isVeryRecent ? '#FBBF24' : isRecent ? '#F59E0B' : '#D97706';
      const glowColor = isVeryRecent ? 'rgba(251, 191, 36, 0.7)' : 'rgba(245, 158, 11, 0.4)';
      const opacity = isVeryRecent ? 1 : isRecent ? 0.8 : 0.55;

      const strikeIcon = L.divIcon({
        className: 'lightning-strike-marker',
        html: `
          <div class="relative flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2" style="opacity: ${opacity}">
            ${
              isVeryRecent
                ? `<div class="absolute w-8 h-8 rounded-full animate-ping" style="background-color: ${glowColor};"></div>`
                : ''
            }
            <div class="w-7 h-7 rounded-full flex items-center justify-center shadow-lg border border-white/80" style="background-color: ${iconColor};">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-950 fill-slate-950" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([lat, lng], { icon: strikeIcon });
      marker.bindPopup(`
        <div class="p-1 font-sans text-xs">
          <div class="flex items-center space-x-1 font-bold text-amber-700">
            <span>⚡ Lightning Strike (${strike.type === 'G' ? 'Cloud-to-Ground' : 'Cloud-to-Cloud'})</span>
          </div>
          <div class="mt-1 text-slate-600">
            <div>Type: <span class="font-medium text-slate-800">${strike.text}</span></div>
            <div>Coordinates: <span class="font-mono text-[11px]">${lat.toFixed(4)}, ${lng.toFixed(4)}</span></div>
            <div>Observed: <span class="font-medium">${age} minute${age === 1 ? '' : 's'} ago</span></div>
          </div>
        </div>
      `);

      lightningGroup.addLayer(marker);
    });
  }, [activeLayer, combinedState, lightningData, isSimulatedDemo]);

  // Center on selected region when user taps row or selects
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedRegionId) return;

    const feature = SINGAPORE_REGIONS_GEOJSON.features.find(
      f => f.properties.id === selectedRegionId
    );
    if (feature) {
      map.flyTo(feature.properties.center, 12, { duration: 0.8 });
    }
  }, [selectedRegionId]);

  const handleResetMap = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo(CONFIG.map.center, CONFIG.map.defaultZoom, { duration: 0.8 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px] z-10" />

      {/* Floating Control Toolbar */}
      <div className="absolute bottom-5 left-4 z-20 flex flex-col space-y-2">
        <button
          onClick={handleResetMap}
          className="p-2.5 bg-white/95 hover:bg-white text-slate-800 rounded-lg shadow-md border border-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          title="Reset map to Singapore overview"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
          <span>Reset View</span>
        </button>

        {/* Basemap Provider Badge */}
        <div className="px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-md shadow-sm border border-slate-200 text-[10px] text-slate-600 flex items-center space-x-1">
          <MapPin className="w-3 h-3 text-cyan-600" />
          <span>Basemap: {usingOsmFallback ? 'OpenStreetMap' : 'OneMap SLA'}</span>
        </div>
      </div>

      {/* Empty State Banner if Lightning active and no strikes */}
      {activeLayer === 'lightning' &&
        (lightningData?.recentCount30Min === 0 || !lightningData) &&
        !isSimulatedDemo && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-slate-900/90 text-white text-xs font-medium rounded-full shadow-lg border border-slate-700 flex items-center space-x-2 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>No active lightning strikes detected in Singapore (past 30 mins)</span>
          </div>
        )}
    </div>
  );
};
