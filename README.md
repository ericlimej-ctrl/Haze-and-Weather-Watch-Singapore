# SG Weather & Haze Watch

A mobile-responsive web application for real-time monitoring of Singapore's regional weather, haze (24-hour PSI and 1-hour PM2.5), rainfall, and lightning.

## Features

- **Basemap**: OneMap Singapore standard tiles (`https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png`) with SLA attribution and automated fallback to OpenStreetMap.
- **Regions**: Singapore's five NEA regions (North, South, East, West, Central) rendered with high-precision boundary polygons and real-time interactive badges.
- **Air Quality (Haze)**:
  - **24-hr PSI**: Colour-coded by NEA bands (Good, Moderate, Unhealthy, Very Unhealthy, Hazardous) with region badges.
  - **1-hr PM2.5**: Categorised by NEA's official Bands I through IV (Normal, Elevated, High, Very High).
  - Detailed modal with sub-indices: PM10, Ozone ($O_3$), Nitrogen Dioxide ($NO_2$), Sulphur Dioxide ($SO_2$), and Carbon Monoxide ($CO$).
  - Official NEA Health Advisories for general healthy individuals and vulnerable groups.
- **Rainfall (5-minute)**: Live rainfall station circles sized and coloured by mm total with pulsing rings on active precipitation.
- **Lightning (30-minute)**: MSS Lightning Detection System (LDS) strikes with age-based fading (fresher strikes glow brighter) and warning alerts.
- **Combined View**: User-selectable simultaneous layer overlays (Haze, Rain, Lightning).
- **2-Hour Forecast**: Searchable area-by-area weather forecast across 47 Singapore planning areas.
- **Responsive Interface**: Desktop split-view and mobile-responsive layout with draggable bottom sheet.
- **Singapore Time (SGT, UTC+8)**: All timestamps formatted in SGT with auto-refresh every 5 minutes and manual refresh.

## Data Sources (NEA via data.gov.sg)

- **PSI (24-hr)**: `https://api-open.data.gov.sg/v2/real-time/api/psi`
- **PM2.5 (1-hr)**: `https://api-open.data.gov.sg/v2/real-time/api/pm25`
- **Rainfall (5-min)**: `https://api-open.data.gov.sg/v2/real-time/api/rainfall`
- **Lightning LDS**: `https://api-open.data.gov.sg/v2/real-time/api/lightning` (with fallback to `weather?api=lightning`)
- **2-Hour Weather Forecast**: `https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast`

All URLs and configurations are centralized in `src/config/endpoints.ts`.

## How to Run

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   The app will run at `http://localhost:3000`.

3. Build for production:
   ```bash
   npm run build
   ```
