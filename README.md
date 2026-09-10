# 🗺️ HMHS Map — Live Navigation & Mapping Platform

> A responsive mapping and navigation application with global location search, GPS positioning, interactive maps, route calculation, voice guidance, route comparison, and AI-assisted route evaluation.

[![Live Domain](https://img.shields.io/badge/Live-hmhsmap.edgeone.dev-059669?style=for-the-badge)](https://hmhsmap.edgeone.dev/) [![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6)](https://www.typescriptlang.org/) [![Leaflet](https://img.shields.io/badge/Maps-Leaflet-green)](https://leafletjs.com/)

## 🌍 Overview

HMHS Map is an HMHS navigation project focused on fast location discovery and route exploration. It combines browser GPS, Leaflet mapping, OSRM-based routing, voice navigation, route simulation, offline tile caching, and AI-assisted route evaluation.

**Live app:** https://hmhsmap.edgeone.dev/

## ✨ Features

- 📍 Browser GPS / Locate Me
- 🌎 Global city and landmark search
- 🛣️ Route calculation through OSRM services
- 🗺️ Interactive Leaflet map
- 🔊 Turn-by-turn voice guidance
- 🚗 Auto-drive route simulation with speed controls
- 📊 Live GPS/compass-style telemetry
- 🤖 Gemini-assisted route evaluation
- 💾 Browser-side map/tile caching
- 🔎 Sitemap, robots, and indexing support
- 📱 Responsive mobile/desktop interface

## 🏗️ Architecture

```text
GPS / Search
     ↓
Location Resolution
     ↓
Leaflet Map + Route Services
     ↓
OSRM Routing
     ├── Navigation UI
     ├── Voice Guidance
     ├── Route Simulation
     └── Route Evaluation
```

## 🛠️ Tech Stack

- React 19 + TypeScript + Vite
- Leaflet
- Express + Node.js
- OpenStreetMap / OSRM routing services
- Google Gemini integration
- Tailwind CSS, Motion, Lucide React
- EdgeOne deployment configuration

## 🚀 Run locally

```bash
npm install
npm run dev
```

Production:

```bash
npm run build
npm start
```

For location features, allow browser geolocation permission. Configure API credentials using environment variables and never commit secrets.

## 🔗 Deployment

The project is configured around the `hmhsmap.edgeone.dev` domain and includes SEO-related endpoints such as `sitemap.xml` and `robots.txt`.

## 🔎 Discoverability

Relevant topics/search terms:

`navigation-app` `maps` `gps` `route-planner` `turn-by-turn-navigation` `leaflet` `openstreetmap` `osrm` `geolocation` `weather-map` `ai-navigation` `gemini-ai` `react` `typescript` `vite` `express` `tailwindcss` `edgeone` `hmhs`

For genuine growth, **⭐ star the repository**, share the live demo with developers interested in mapping, and contribute useful fixes or features. Do not use artificial stars, views, or spam.

## 👤 Author

**Hafiz Mohammed Huzaifa Shamim (HMHS)**

## 📄 License

See the repository license for usage terms.
