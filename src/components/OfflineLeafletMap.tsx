import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RoutePoint, CalculatedRoute, TrafficIncident, POI, MapProvider } from '../types/map';

// Fix default Leaflet icon paths
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface OfflineLeafletMapProps {
  center: [number, number];
  zoom: number;
  provider: MapProvider;
  showTraffic: boolean;
  origin: RoutePoint | null;
  destination: RoutePoint | null;
  inspectedLocation: RoutePoint | { name: string; address?: string; lat: number; lng: number } | null;
  calculatedRoute: CalculatedRoute | null;
  incidents: TrafficIncident[];
  pois: POI[];
  selectedCategory: string | null;
  isNavigating: number; // 0 = none, 1 = active, 2 = paused
  currentStepIndex: number;
  userGpsLocation: [number, number] | null;
  isMeasuringDistance?: boolean;
  measurePoints?: [number, number][];
  onMapClick?: (lat: number, lng: number) => void;
  onSelectPOI?: (poi: POI) => void;
  onSelectIncident?: (incident: TrafficIncident) => void;
  onSelectRouteAlternative?: (route: CalculatedRoute) => void;
}

export function OfflineLeafletMap({
  center,
  zoom,
  provider,
  showTraffic,
  origin,
  destination,
  inspectedLocation,
  calculatedRoute,
  incidents,
  pois,
  selectedCategory,
  isNavigating,
  currentStepIndex,
  userGpsLocation,
  isMeasuringDistance = false,
  measurePoints = [],
  onMapClick,
  onSelectPOI,
  onSelectIncident,
  onSelectRouteAlternative,
}: OfflineLeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayTileLayerRef = useRef<L.TileLayer | null>(null);
  const trafficLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const navMarkerRef = useRef<L.Marker | null>(null);
  const lastTargetRef = useRef<{ lat: number; lng: number; zoom: number }>({ lat: center[0], lng: center[1], zoom });

  // Initialize Map with Whole World (zoom 1) to 25m Gully Level (zoom 21)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: center,
      zoom: zoom,
      zoomControl: false,
      minZoom: 1,      // Zoom out to the entire planet Earth (Whole World)
      maxZoom: 21,     // Zoom in to 25-meter street/gully/building level
      worldCopyJump: true,
      preferCanvas: true, // Hardware-accelerated Canvas renderer for 60fps polyline rendering
      fadeAnimation: true,
      zoomAnimation: true,
      markerZoomAnimation: true,
    });

    // Add zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Add Metric scale bar (shows 25m, 50m, 100m, 1km, etc. in bottom left)
    L.control.scale({
      position: 'bottomleft',
      metric: true,
      imperial: false,
      maxWidth: 120,
    }).addTo(map);

    // Create Layer Groups
    const trafficGroup = L.layerGroup().addTo(map);
    const routeGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);

    trafficLayerGroupRef.current = trafficGroup;
    routeLayerGroupRef.current = routeGroup;
    markersLayerGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Handle Map Clicks
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    });

    // Resize Observer to prevent any grey tile glitches on layout/window changes
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ debounceMoveend: true });
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer with maxNativeZoom: 19 & maxZoom: 21 for smooth 25m scaling without glitching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }
    if (overlayTileLayerRef.current) {
      map.removeLayer(overlayTileLayerRef.current);
      overlayTileLayerRef.current = null;
    }

    let tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    let maxNativeZoom = 19;
    let subdomains: string | string[] = 'abc';
    let tileClassName = '';

    if (provider === 'carto-voyager') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      attribution = '&copy; CartoDB &copy; OpenStreetMap';
      maxNativeZoom = 19;
      subdomains = 'abcd';
    } else if (provider === 'esri-satellite') {
      // Google Hybrid HD Satellite Imagery (Crystal clear, smooth HD satellite imagery with sharp road vectors)
      tileUrl = 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      attribution = '&copy; Google Maps Satellite HD';
      maxNativeZoom = 20;
      subdomains = ['0', '1', '2', '3'];
      tileClassName = 'satellite-sharp-hd';
    } else if (provider === 'osm-topo') {
      tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = 'Map data: &copy; OpenStreetMap, SRTM | Style: &copy; OpenTopoMap';
      maxNativeZoom = 17;
      subdomains = 'abc';
    } else if (provider === 'carto-dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; CartoDB &copy; OpenStreetMap';
      maxNativeZoom = 19;
      subdomains = 'abcd';
    } else if (provider === 'humanitarian') {
      tileUrl = 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors, Humanitarian Team';
      maxNativeZoom = 19;
      subdomains = 'abc';
    }

    const newLayer = L.tileLayer(tileUrl, {
      minZoom: 1,
      maxZoom: 21,
      maxNativeZoom: maxNativeZoom,
      subdomains: subdomains,
      attribution,
      noWrap: false,
      className: tileClassName,
      keepBuffer: 4,
      updateInterval: 100,
      updateWhenIdle: true,
      updateWhenZooming: false,
    });

    newLayer.addTo(map);
    tileLayerRef.current = newLayer;

    // Invalidate size immediately to guarantee zero black/grey squares
    map.invalidateSize();
  }, [provider]);

  const prevCenterRef = useRef<[number, number]>(center);
  const prevZoomRef = useRef<number>(zoom);

  // Update Center & Zoom smoothly when props explicitly change (prevents map jump-back glitch on pan)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const centerChanged = prevCenterRef.current[0] !== center[0] || prevCenterRef.current[1] !== center[1];
    const zoomChanged = prevZoomRef.current !== zoom;

    if (centerChanged || zoomChanged) {
      prevCenterRef.current = center;
      prevZoomRef.current = zoom;

      const currentMapCenter = map.getCenter();
      const dLat = Math.abs(currentMapCenter.lat - center[0]);
      const dLng = Math.abs(currentMapCenter.lng - center[1]);

      lastTargetRef.current = { lat: center[0], lng: center[1], zoom };
      map.flyTo(center, Math.min(21, Math.max(1, zoom)), {
        duration: dLat > 2 || dLng > 2 ? 1.4 : 0.8,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom]);

  // Traffic Polylines: Clear any artificial lines (Real road geometry is drawn only when routes are calculated)
  useEffect(() => {
    const trafficGroup = trafficLayerGroupRef.current;
    if (!trafficGroup) return;
    trafficGroup.clearLayers();
  }, [showTraffic]);

  // Render Markers (Inspected Point, Origin, Destination, Incidents, POIs, GPS)
  useEffect(() => {
    const markersGroup = markersLayerGroupRef.current;
    if (!markersGroup) return;
    markersGroup.clearLayers();

    // 0. Inspected Pin Marker (Selected point on map)
    if (inspectedLocation) {
      const inspectIcon = L.divIcon({
        className: 'custom-inspect-icon',
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; inset: 0; background: rgba(16, 185, 129, 0.35); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="background-color: #10b981; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.4); font-size: 14px;">
              📍
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([inspectedLocation.lat, inspectedLocation.lng], { icon: inspectIcon, zIndexOffset: 500 })
        .bindPopup(`<strong>${inspectedLocation.name}</strong><br/><span style="color:#6b7280; font-size:11px;">${inspectedLocation.address || ''}</span>`)
        .addTo(markersGroup);
    }

    // 1. Origin Marker
    if (origin) {
      const originIcon = L.divIcon({
        className: 'custom-origin-icon',
        html: `
          <div style="background-color: #10b981; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-weight: bold; font-size: 11px;">
            A
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([origin.lat, origin.lng], { icon: originIcon, zIndexOffset: 600 })
        .bindPopup(`<strong>Start:</strong> ${origin.name}<br/><span style="color:#6b7280; font-size:11px;">${origin.address || origin.city || ''}</span>`)
        .addTo(markersGroup);
    }

    // 2. Destination Marker
    if (destination) {
      const destIcon = L.divIcon({
        className: 'custom-dest-icon',
        html: `
          <div style="background-color: #ef4444; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-weight: bold; font-size: 11px;">
            B
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([destination.lat, destination.lng], { icon: destIcon, zIndexOffset: 600 })
        .bindPopup(`<strong>Destination:</strong> ${destination.name}<br/><span style="color:#6b7280; font-size:11px;">${destination.address || destination.city || ''}</span>`)
        .addTo(markersGroup);
    }

    // 3. User GPS Location Marker with High Accuracy Radar
    if (userGpsLocation) {
      // Draw accuracy circle
      L.circle(userGpsLocation, {
        radius: 35,
        color: '#3b82f6',
        fillColor: '#60a5fa',
        fillOpacity: 0.18,
        weight: 1.5,
      }).addTo(markersGroup);

      const gpsIcon = L.divIcon({
        className: 'custom-gps-icon',
        html: `
          <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 28px; height: 28px; background-color: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 18px; height: 18px; background-color: #1d4ed8; border: 3px solid #ffffff; border-radius: 50%; box-shadow: 0 0 12px rgba(29, 78, 216, 0.8);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker(userGpsLocation, { icon: gpsIcon, zIndexOffset: 800 })
        .bindPopup(`
          <div style="padding: 4px; font-family: sans-serif;">
            <strong style="color:#1d4ed8; font-size:13px;">📍 Live Real Location</strong><br/>
            <span style="font-size:11px; color:#4b5563;">Coordinates: ${userGpsLocation[0].toFixed(5)}, ${userGpsLocation[1].toFixed(5)}</span><br/>
            <span style="font-size:10px; color:#059669; font-weight: bold;">● Active GPS Sensor</span>
          </div>
        `)
        .addTo(markersGroup);
    }

    // 4. Traffic Incidents Markers
    if (showTraffic && incidents) {
      incidents.forEach(inc => {
        const isBlock = inc.severity === 'high' || inc.severity === 'blocked';
        const incIcon = L.divIcon({
          className: 'custom-incident-icon',
          html: `
            <div style="background-color: ${isBlock ? '#dc2626' : '#d97706'}; color: white; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
              ⚠️
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker(inc.coordinates, { icon: incIcon }).addTo(markersGroup);
        marker.on('click', () => onSelectIncident && onSelectIncident(inc));
        marker.bindPopup(`
          <div style="padding: 4px;">
            <strong style="color:#b91c1c;">${inc.title}</strong><br/>
            <span style="font-size:11px; color:#4b5563;">${inc.locationName}</span><br/>
            <p style="font-size:12px; margin-top:4px;">${inc.description}</p>
          </div>
        `);
      });
    }

    // 5. POIs Markers (Only show when user explicitly requests/filters a category)
    if (selectedCategory && selectedCategory !== 'all') {
      const filteredPOIs = pois.filter(p => p.category === selectedCategory);
      filteredPOIs.forEach(poi => {
        let iconEmoji = '📍';
        let bgCol = '#4b5563';
        if (poi.category === 'hospital') { iconEmoji = '🏥'; bgCol = '#ef4444'; }
        if (poi.category === 'petrol') { iconEmoji = '⛽'; bgCol = '#f59e0b'; }
        if (poi.category === 'mosque') { iconEmoji = '🕌'; bgCol = '#10b981'; }
        if (poi.category === 'food') { iconEmoji = '🍛'; bgCol = '#f97316'; }
        if (poi.category === 'landmark') { iconEmoji = '🏛️'; bgCol = '#8b5cf6'; }

        const poiIcon = L.divIcon({
          className: 'custom-poi-icon',
          html: `
            <div style="background-color: ${bgCol}; color: white; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.25);">
              ${iconEmoji}
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const m = L.marker([poi.lat, poi.lng], { icon: poiIcon }).addTo(markersGroup);
        m.on('click', () => onSelectPOI && onSelectPOI(poi));
        m.bindPopup(`
          <div style="padding: 4px;">
            <strong>${poi.name}</strong><br/>
            <span style="font-size:11px; color:#6b7280;">${poi.address}</span><br/>
            ${poi.rating ? `<span style="font-size:11px; color:#d97706;">★ ${poi.rating}</span>` : ''}
          </div>
        `);
      });
    }
  }, [inspectedLocation, origin, destination, userGpsLocation, incidents, pois, selectedCategory, showTraffic]);

  const prevRouteIdRef = useRef<string | null>(null);

  // Render Calculated Route Polyline, Alternative Paths & AI Fastest/Safest Route Badge
  useEffect(() => {
    const routeGroup = routeLayerGroupRef.current;
    const map = mapInstanceRef.current;
    if (!routeGroup || !map) return;
    routeGroup.clearLayers();

    if (!calculatedRoute || calculatedRoute.fullPolyline.length === 0) {
      prevRouteIdRef.current = null;
      return;
    }

    const isNewRoute = prevRouteIdRef.current !== calculatedRoute.id;
    prevRouteIdRef.current = calculatedRoute.id;

    // 1. Render all alternative corridors as distinct clickable paths
    if (calculatedRoute.alternativeRoutes && calculatedRoute.alternativeRoutes.length > 1) {
      calculatedRoute.alternativeRoutes.forEach(alt => {
        if (alt.id !== calculatedRoute.id && alt.fullPolyline.length > 0) {
          let altColor = '#64748b';
          let altDash = '6, 8';
          if (alt.routeType === 'best_route_ever') altColor = '#10b981';
          else if (alt.routeType === 'fastest_time') altColor = '#06b6d4';
          else if (alt.routeType === 'shortest_distance') altColor = '#3b82f6';

          const altPoly = L.polyline(alt.fullPolyline, {
            color: altColor,
            weight: 6,
            opacity: 0.75,
            dashArray: altDash,
            lineCap: 'round',
            smoothFactor: 1.0,
            className: 'clickable-route-alternative',
          }).addTo(routeGroup);

          altPoly.on('click', () => {
            if (onSelectRouteAlternative) {
              onSelectRouteAlternative(alt);
            }
          });

          altPoly.bindTooltip(
            `<strong>${alt.corridorBadge || alt.summary}</strong><br/>${alt.durationMin} min • ${alt.distanceKm} km • ${alt.safetyMetrics?.safetyScore || 95}% Safe (Tap to select)`,
            { sticky: true, opacity: 0.95, className: 'leaflet-custom-tooltip' }
          );
        }
      });
    }

    // 2. Active Selected Route Color Themes
    let primaryColor = '#10b981';
    let glowColor = '#064e3b';
    let badgeText = '✨ Best Route Ever: 🌿 Scenic & 99% Safe';

    if (calculatedRoute.routeType === 'best_route_ever') {
      primaryColor = '#10b981';
      glowColor = '#064e3b';
      badgeText = `✨ Best Route Ever: 🌿 Scenic & ${calculatedRoute.safetyMetrics?.safetyScore || 99}% Safe`;
    } else if (calculatedRoute.routeType === 'fastest_time') {
      primaryColor = '#06b6d4';
      glowColor = '#155e75';
      badgeText = '⚡ 100% Real Road: Fastest';
    } else if (calculatedRoute.routeType === 'shortest_distance') {
      primaryColor = '#3b82f6';
      glowColor = '#1e3a8a';
      badgeText = '📏 Nearest Direct Road';
    }

    // Background glow/border for active route
    L.polyline(calculatedRoute.fullPolyline, {
      color: glowColor,
      weight: 10,
      opacity: 0.85,
      smoothFactor: 1.0,
    }).addTo(routeGroup);

    // Foreground active route path
    const routePoly = L.polyline(calculatedRoute.fullPolyline, {
      color: primaryColor,
      weight: 6,
      opacity: 0.98,
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 1.0,
    }).addTo(routeGroup);

    // 3. Place Route Intelligence & Safety Badge at midpoint
    const midIdx = Math.floor(calculatedRoute.fullPolyline.length / 2);
    const midPoint = calculatedRoute.fullPolyline[midIdx];
    if (midPoint && !isNavigating) {
      const badgeIcon = L.divIcon({
        className: 'ai-fastest-route-badge',
        html: `
          <div style="background-color: ${glowColor}; border: 2px solid ${primaryColor}; color: white; padding: 4px 10px; border-radius: 14px; font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(0,0,0,0.6); white-space: nowrap;">
            <span>${badgeText}</span>
            <span style="background: rgba(255,255,255,0.22); padding: 1px 6px; border-radius: 8px; font-size: 10px;">${calculatedRoute.durationMin}m • ${calculatedRoute.distanceKm}km</span>
          </div>
        `,
        iconSize: [210, 28],
        iconAnchor: [105, 14],
      });
      L.marker(midPoint, { icon: badgeIcon, interactive: false }).addTo(routeGroup);
    }

    // Zoom map to fit route smoothly when route is first calculated
    if (!isNavigating && isNewRoute) {
      map.fitBounds(routePoly.getBounds(), { padding: [60, 60], maxZoom: 18 });
    }
  }, [calculatedRoute, isNavigating, onSelectRouteAlternative]);

  // Handle Live Real GPS Navigation Vehicle Movement
  useEffect(() => {
    const routeGroup = routeLayerGroupRef.current;
    const map = mapInstanceRef.current;
    if (!routeGroup || !map || !calculatedRoute) return;

    if (isNavigating > 0) {
      // Strictly use REAL user GPS location or origin — NEVER auto-advance along steps artificially
      const navPos: [number, number] = userGpsLocation 
        ? userGpsLocation 
        : origin 
        ? [origin.lat, origin.lng] 
        : calculatedRoute.fullPolyline[0];

      if (!navMarkerRef.current) {
        const carIcon = L.divIcon({
          className: 'custom-nav-vehicle',
          html: `
            <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 36px; height: 36px; background-color: rgba(16, 185, 129, 0.35); border-radius: 50%; animation: pulse 2s infinite;"></div>
              <div style="width: 28px; height: 28px; background-color: #059669; border: 3px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.5);">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                  <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
                </svg>
              </div>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        navMarkerRef.current = L.marker(navPos, { icon: carIcon, zIndexOffset: 1000 }).addTo(routeGroup);
      } else {
        navMarkerRef.current.setLatLng(navPos);
      }

      // Smooth pan map to follow real live location
      map.panTo(navPos, { animate: true, duration: 0.5 });
    } else {
      if (navMarkerRef.current) {
        routeGroup.removeLayer(navMarkerRef.current);
        navMarkerRef.current = null;
      }
    }
  }, [isNavigating, userGpsLocation, origin, calculatedRoute]);

  // Distance Measuring Polyline Layer
  useEffect(() => {
    const routeGroup = routeLayerGroupRef.current;
    if (!routeGroup) return;

    if (measurePoints && measurePoints.length > 0) {
      // Draw dashed blue tape line between measure points
      const tapePoly = L.polyline(measurePoints, {
        color: '#3b82f6',
        weight: 4,
        dashArray: '8, 8',
        opacity: 0.9,
      }).addTo(routeGroup);

      // Add node dots
      measurePoints.forEach((pt, idx) => {
        const dotIcon = L.divIcon({
          className: 'measure-dot-icon',
          html: `<div style="width:12px; height:12px; background:#3b82f6; border:2px solid white; border-radius:50%; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
        L.marker(pt, { icon: dotIcon, zIndexOffset: 900 }).addTo(routeGroup);
      });
    }
  }, [measurePoints]);

  return (
    <div
      id="free-pakistan-map-canvas"
      ref={mapContainerRef}
      className="w-full h-full relative z-0"
    />
  );
}
