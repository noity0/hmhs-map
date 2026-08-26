# HMHS Map — Ultra Live Navigation Platform

[![Live Domain](https://img.shields.io/badge/Live_Domain-hmhsmap.edgeone.dev-059669?style=for-the-badge&logo=googlemaps&logoColor=white)](https://hmhsmap.edgeone.dev/)
[![Read Only Link](https://img.shields.io/badge/Read_Only_Access-No_Edit_Permissions-0284c7?style=for-the-badge&logo=shieldsdotio&logoColor=white)](https://ais-pre-dhf4vzkhgkboi775en5ol5-1019729835090.asia-southeast1.run.app)
[![CDN](https://img.shields.io/badge/Edge_CDN-Tencent_EdgeOne-0284c7?style=for-the-badge)](https://hmhsmap.edgeone.dev/)
[![Status](https://img.shields.io/badge/System_Status-Online-10b981?style=for-the-badge)](#)

> **HMHS Map** is a high-performance, real-time GPS navigation and global mapping system optimized for worldwide search and street-level accuracy across Pakistan. Hosted on the custom edge domain **[https://hmhsmap.edgeone.dev/](https://hmhsmap.edgeone.dev/)**.

---

## 🔒 Permanent Read-Only Public Link (View Only — No One Can Edit)

You can share the application with clients, drivers, and users using the official **read-only live link**. Anyone with this link can use the full live map, search locations, get voice turn-by-turn directions, and test routes, but **nobody can edit, modify code, delete files, or alter settings**.

| Access Type | Public URL | Permissions |
| :--- | :--- | :--- |
| **🌐 Canonical Edge Domain** | **[https://hmhsmap.edgeone.dev/](https://hmhsmap.edgeone.dev/)** | **Read-Only / Live Navigation** |
| **🛡️ Standalone Shared App Preview** | **[https://ais-pre-dhf4vzkhgkboi775en5ol5-1019729835090.asia-southeast1.run.app](https://ais-pre-dhf4vzkhgkboi775en5ol5-1019729835090.asia-southeast1.run.app)** | **Read-Only / Isolated Container** |
| **🗺️ XML Sitemap Feed** | `https://hmhsmap.edgeone.dev/sitemap.xml` | Public Search Crawlers |
| **🤖 Robots Directives** | `https://hmhsmap.edgeone.dev/robots.txt` | Indexing Directives |

### 📋 Steps to Use & Share the Read-Only Link

1. **Step 1 — Copy Link**:
   * Open or copy either **`https://hmhsmap.edgeone.dev/`** or **`https://ais-pre-dhf4vzkhgkboi775en5ol5-1019729835090.asia-southeast1.run.app`**.
2. **Step 2 — Distribute to Users**:
   * Send the link via WhatsApp, Email, SMS, QR Code, or embed on your website.
3. **Step 3 — Open on Any Device**:
   * Works immediately in Chrome, Safari, Firefox, or Edge on iOS, Android, macOS, and Windows.
   * No app download or sign-in is required.
4. **Step 4 — Use Real-Time Navigation**:
   * Tap the **GPS "Locate Me"** button to lock onto physical hardware GPS coordinates.
   * Search any city, landmark, or gully (e.g., Karachi, Lahore, Makkah, London, Times Square).
   * Click **"Directions"** to calculate the real road network route and tap **"Start"** or **"Auto-Drive"** for turn-by-turn voice guidance.
5. **Step 5 — Total Safety & Integrity**:
   * The code editor, terminal, secrets, and repository files are completely disabled and inaccessible from this URL.

---

## 🔗 Custom Domain & Edge Link System

The application is fully bound to the custom domain **`hmhsmap.edgeone.dev`**.

* **Primary Web URL**: [https://hmhsmap.edgeone.dev/](https://hmhsmap.edgeone.dev/)
* **Sitemap Feed**: [https://hmhsmap.edgeone.dev/sitemap.xml](https://hmhsmap.edgeone.dev/sitemap.xml)
* **Robots Directives**: [https://hmhsmap.edgeone.dev/robots.txt](https://hmhsmap.edgeone.dev/robots.txt)
* **Domain Status Endpoint**: `GET /api/domain-info`
* **Edge Routing Configuration**: `edgeone.json`

---

## ✨ Key Features

### 1. 🌍 Global & Pakistan Location Resolution
* Search and jump instantly to metropolises worldwide (Makkah, Madinah, London, New York, Tokyo, Dubai, Paris, Toronto, etc.) and global landmarks (The Holy Kaaba, Burj Khalifa, Eiffel Tower, Times Square, etc.).
* Deep street-level accuracy for Pakistan cities (Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Multan, Faisalabad, and all motorways).

### 2. ⚡ Hardware-Accelerated 60fps Map Canvas
* Built on a hardware-accelerated Canvas renderer (`preferCanvas: true`) with adaptive polyline smoothing (`smoothFactor: 1.0`).
* Stutter-free panning, zooming (1x planetary view to 21x street/gully view), and multi-route rendering.

### 3. 🚀 Ultra-Fast Parallel OSRM Routing
* Concurrent mirror queries (`Promise.any`) across high-speed OpenStreetMap / OSRM endpoints.
* Fast in-memory server cache and client cache for <300ms route calculation and instant corridor switching.

### 4. 🌿 Best Route Ever & AI Optimization
* AI-assisted route evaluation via **Gemini 3.7 Flash**.
* Prefers lush greenery, divided highways, flyovers, and bypasses for maximum driver comfort and scenic views.

### 5. 🔊 Turn-by-Turn Voice Navigation & Simulation
* Web Speech API integration for real-time voice guidance instructions.
* **Auto-Drive Simulation Engine** with speed multipliers (1x, 2x, 5x, 10x) and step controls (`< Prev`, `Next >`).
* Interactive **Trip Completion & Arrival Summary** modal with distance, duration, safety score, and corridor badges.

### 6. 📊 Live Telemetry HUD
* Real-time GPS coordinate display (DD/DMS format).
* Live hardware compass speedometer with vehicle limit indicators.
* Live zoom scale indicator (Global -> Country -> City -> Street/Gully).

### 7. ⚡ 1-Click Search Engine Indexing
* Integrated IndexNow API protocol for immediate broadcast to Bing, Yandex, Seznam, and Naver.
* Automatic ping dispatches for Googlebot and Bing Webmaster crawlers.

### 8. 💾 Offline Map Caching
* Browser local tile caching for zero-bandwidth emergency navigation.

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion.
* **Mapping Engine**: Leaflet with custom hardware-accelerated Canvas polyline layers.
* **Backend Proxy**: Express Node server with OSRM routing proxies and Gemini AI API integration.
* **CDN & Edge Layer**: Tencent Cloud EdgeOne (`edgeone.json`).

---

## 📁 Repository Structure

```
.
├── README.md               # Complete project documentation & domain details
├── edgeone.json            # Tencent Cloud EdgeOne CDN deployment configuration
├── server.ts               # Express server with route proxy, SEO, & domain headers
├── index.html              # HTML5 entry with canonical domain meta tags & JSON-LD
├── metadata.json           # Application metadata & capabilities
├── .env.example            # Environment variable template with CANONICAL_DOMAIN
├── src/
│   ├── App.tsx             # Main application HUD & state manager
│   ├── components/         # Map UI components, modals, search panel, HUDs
│   │   ├── CityQuickBar.tsx
│   │   ├── NavigationBanner.tsx
│   │   ├── OfflineLeafletMap.tsx
│   │   ├── RouteCompletionModal.tsx
│   │   ├── RouteSearchPanel.tsx
│   │   └── SeoIndexingModal.tsx
│   ├── services/           # Routing, learning, & geocoding services
│   │   ├── routingService.ts
│   │   └── routeLearningService.ts
│   ├── utils/
│   │   └── domainConfig.ts # Centralized domain configuration for hmhsmap.edgeone.dev
│   └── data/               # World & Pakistan location databases
```

---

## 🚀 Getting Started

### Prerequisites
* Node.js v18+
* npm or bun

### Git Remote & Push Instructions (If pushing to your own GitHub/GitLab)

If you are pushing this repository to GitHub or GitLab:

1. **Add your remote repository**:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   ```
2. **Push to main branch**:
   ```bash
   git push -u origin main
   ```
3. If the remote already has commits (e.g. an initial license or readme), use:
   ```bash
   git pull --rebase origin main
   git push -u origin main
   ```

### Installation & Running Locally

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd react-example
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Set your `GEMINI_API_KEY` in `.env`.

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

6. **Start Production Server**:
   ```bash
   npm run start
   ```

---

## 🌐 Custom Domain Setup (`hmhsmap.edgeone.dev`)

To host or point your custom domain `hmhsmap.edgeone.dev`:

1. Set up a CNAME record in your DNS provider pointing `hmhsmap.edgeone.dev` to your EdgeOne / Cloud Run origin host.
2. Deploy using `edgeone.json` on Tencent Cloud EdgeOne or your chosen CDN.
3. The Express server automatically attaches canonical header flags (`X-Served-By-Domain: hmhsmap.edgeone.dev`) and handles `/sitemap.xml`, `/robots.txt`, and `/api/seo/instant-index`.

---

## 📄 License

Developed for HMHS Map Technologies. All rights reserved.
