import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import { RegionId } from '../types/weather';

export interface RegionFeatureProperties {
  id: RegionId;
  name: string;
  center: [number, number]; // [lat, lng]
  description: string;
}

/**
 * GeoJSON FeatureCollection for Singapore's 5 NEA Regions
 * (North, South, East, West, Central)
 * Coordinates in [longitude, latitude] per GeoJSON standard.
 */
export const SINGAPORE_REGIONS_GEOJSON: FeatureCollection<Polygon | MultiPolygon, RegionFeatureProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'north',
        name: 'North',
        center: [1.41803, 103.82],
        description: 'Woodlands, Sembawang, Yishun, Mandai, Simpang, Sungei Kadut',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.715, 1.442],
            [103.738, 1.455],
            [103.768, 1.450],
            [103.785, 1.453],
            [103.815, 1.465],
            [103.840, 1.460],
            [103.865, 1.435],
            [103.880, 1.415],
            [103.882, 1.398],
            [103.860, 1.385],
            [103.835, 1.380],
            [103.805, 1.385],
            [103.775, 1.395],
            [103.750, 1.405],
            [103.725, 1.415],
            [103.715, 1.442],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'central',
        name: 'Central',
        center: [1.35735, 103.82],
        description: 'Bishan, Toa Payoh, Ang Mo Kio, Novena, Bukit Timah, Central Catchment',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [103.775, 1.395],
            [103.805, 1.385],
            [103.835, 1.380],
            [103.860, 1.385],
            [103.882, 1.398],
            [103.885, 1.365],
            [103.880, 1.335],
            [103.870, 1.312],
            [103.845, 1.305],
            [103.820, 1.315],
            [103.790, 1.330],
            [103.765, 1.355],
            [103.765, 1.380],
            [103.775, 1.395],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'west',
        name: 'West',
        center: [1.35735, 103.7],
        description: 'Jurong East/West, Clementi, Choa Chu Kang, Bukit Batok, Tuas, Pioneer',
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // Mainland West
          [
            [
              [103.715, 1.442],
              [103.725, 1.415],
              [103.750, 1.405],
              [103.775, 1.395],
              [103.765, 1.380],
              [103.765, 1.355],
              [103.790, 1.330],
              [103.775, 1.300],
              [103.760, 1.285],
              [103.720, 1.305],
              [103.680, 1.315],
              [103.630, 1.320],
              [103.605, 1.290],
              [103.635, 1.230],
              [103.665, 1.270],
              [103.670, 1.350],
              [103.685, 1.400],
              [103.700, 1.425],
              [103.715, 1.442],
            ],
          ],
          // Jurong Island & Western offshore
          [
            [
              [103.680, 1.280],
              [103.725, 1.280],
              [103.740, 1.255],
              [103.710, 1.230],
              [103.670, 1.250],
              [103.680, 1.280],
            ],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'east',
        name: 'East',
        center: [1.35735, 103.94],
        description: 'Tampines, Pasir Ris, Bedok, Changi, Paya Lebar, Pulau Ubin, Pulau Tekong',
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // Mainland East
          [
            [
              [103.882, 1.398],
              [103.905, 1.400],
              [103.935, 1.390],
              [103.965, 1.380],
              [104.010, 1.360],
              [104.030, 1.340],
              [103.990, 1.310],
              [103.940, 1.295],
              [103.890, 1.298],
              [103.870, 1.312],
              [103.880, 1.335],
              [103.885, 1.365],
              [103.882, 1.398],
            ],
          ],
          // Pulau Ubin & Pulau Tekong
          [
            [
              [103.935, 1.425],
              [103.995, 1.420],
              [103.985, 1.400],
              [103.945, 1.405],
              [103.935, 1.425],
            ],
          ],
          [
            [
              [104.020, 1.425],
              [104.065, 1.420],
              [104.060, 1.390],
              [104.020, 1.395],
              [104.020, 1.425],
            ],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'south',
        name: 'South',
        center: [1.29587, 103.82],
        description: 'City, Downtown, Bukit Merah, Queenstown, Marina Bay, Sentosa',
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          // Mainland South
          [
            [
              [103.775, 1.300],
              [103.790, 1.330],
              [103.820, 1.315],
              [103.845, 1.305],
              [103.870, 1.312],
              [103.890, 1.298],
              [103.875, 1.275],
              [103.855, 1.265],
              [103.830, 1.260],
              [103.795, 1.275],
              [103.760, 1.285],
              [103.775, 1.300],
            ],
          ],
          // Sentosa & Southern Islands
          [
            [
              [103.810, 1.258],
              [103.840, 1.255],
              [103.845, 1.238],
              [103.820, 1.242],
              [103.810, 1.258],
            ],
          ],
        ],
      },
    },
  ],
};
