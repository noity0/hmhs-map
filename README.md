# HMHS Map — Interactive Maps & Route Exploration

[![GitHub stars](https://img.shields.io/github/stars/noity0/hmhs-map?style=flat-square)](https://github.com/noity0/hmhs-map/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/noity0/hmhs-map?style=flat-square)](https://github.com/noity0/hmhs-map/issues)
[![Live app](https://img.shields.io/badge/Live%20app-hmhsmap.edgeone.dev-0A8F6A?style=flat-square)](https://hmhsmap.edgeone.dev/)

> A responsive mapping and navigation project combining location search, browser geolocation, interactive maps, route exploration, and voice-guidance experiments.

**Live application:** [https://hmhsmap.edgeone.dev](https://hmhsmap.edgeone.dev)

## Overview

HMHS Map is an HMHS mapping project for exploring places and routes through a browser-based interface. The repository uses React, TypeScript, Leaflet, and Google Maps React integration, with an Express server and Gemini integration for AI-assisted features.

## Features

- Browser geolocation with user permission.
- Search-oriented location discovery.
- Interactive map views.
- Route calculation and route comparison workflows.
- Voice-guidance and route-simulation interface elements.
- AI-assisted route evaluation.
- Responsive layouts for desktop and mobile screens.

Actual route availability, map coverage, and feature behavior depend on the configured map and routing services, browser permissions, network access, and provider limits.

## Architecture at a glance

```text
Location input / browser GPS
            |
            v
     Location resolution
            |
            v
   Map and routing services
            |
            v
      React map interface
       |       |       |
     Routes  Guidance  Insights
```

## Technology stack

- React 19, TypeScript, and Vite
- Leaflet and React Google Maps integration
- Node.js and Express
- Google Gemini SDK
- Tailwind CSS, Motion, and Lucide React

## Requirements

- Node.js 22 LTS recommended
- npm
- A modern browser
- Browser location permission for GPS features
- Provider credentials where required by the selected map or AI feature

## Install on Windows

```powershell
git clone https://github.com/noity0/hmhs-map.git
Set-Location hmhs-map
npm install
```

Create and edit your local environment file:

```powershell
Copy-Item .env.example .env
notepad .env
```

The supplied example includes:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
CANONICAL_DOMAIN=hmhsmap.edgeone.dev
PUBLIC_SITE_URL=https://hmhsmap.edgeone.dev
```

Use real values appropriate to your environment. Do not commit API keys or deployment secrets.

## Run and build

```powershell
npm run dev
```

For a production build:

```powershell
npm run build
npm start
```

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Express/TypeScript development server |
| `npm run build` | Build the frontend and bundle the server |
| `npm start` | Start the built server |
| `npm run preview` | Preview the frontend build |
| `npm run lint` | Run TypeScript checks |

## Browser permissions and service notes

- Allow location access only when you want to use GPS-based features.
- Use HTTPS for deployed geolocation workflows.
- Map tiles, geocoding, and routing may be provided by external services with their own usage policies and rate limits.
- Keep API credentials server-side wherever the provider supports it.

## Contributing

Report reproducible bugs with browser, operating system, steps, and relevant console/server messages. Contributions that improve accessibility, map performance, error handling, and documentation are welcome.

- [Issues](https://github.com/noity0/hmhs-map/issues)
- [Source code](https://github.com/noity0/hmhs-map)

## License

See the repository's `LICENSE` file if present. Without an explicit license, reuse and redistribution are not automatically permitted.

## Search terms

Interactive map, navigation app, route planner, GPS location, geolocation, Leaflet, Google Maps, route exploration, voice guidance, Gemini AI, React, TypeScript, HMHS.

<!-- COMMUNITY-CONTRIBUTORS-SECTION -->
## Contributors & community

[![Contributors](https://img.shields.io/github/contributors/noity0/hmhs-map?style=flat-square)](https://github.com/noity0/hmhs-map/graphs/contributors)
[![Pull requests](https://img.shields.io/github/issues-pr/noity0/hmhs-map?style=flat-square)](https://github.com/noity0/hmhs-map/pulls)
[![Open issues](https://img.shields.io/github/issues/noity0/hmhs-map?style=flat-square)](https://github.com/noity0/hmhs-map/issues)

<a href="https://github.com/noity0/hmhs-map/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=noity0/hmhs-map&max=100&columns=10" alt="GitHub contributors to hmhs-map" />
</a>

This live contributor panel is generated from GitHub's repository contribution data. It shows real contributors when GitHub has qualifying contribution records; it does not imply endorsement by other developers or companies.

### How to contribute

1. Check the [open issues](https://github.com/noity0/hmhs-map/issues) and [pull requests](https://github.com/noity0/hmhs-map/pulls) before starting.
2. Open an issue to discuss substantial changes.
3. Fork the repository and create a focused branch.
4. Keep pull requests small and explain the problem, solution, and testing performed.
5. Update documentation and tests when behavior changes.
6. Never commit API keys, passwords, private data, or other secrets.

### Upstream projects & acknowledgements

This project builds on the open-source tools named in its technology stack. Visit their official documentation and repositories to learn more, and follow each project's license and attribution requirements. Upstream maintainers and well-known developers are not listed as project contributors unless they have verifiable contributions here.

- [GitHub: Contributing to projects](https://docs.github.com/en/get-started/quickstart/contributing-to-projects)
- [GitHub: Project contributors](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-a-projects-contributors)
