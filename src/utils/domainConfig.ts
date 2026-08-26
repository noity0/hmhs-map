// Centralized Domain & EdgeLink System Configuration for HMHS Map
export const DOMAIN_CONFIG = {
  domain: 'hmhsmap.edgeone.dev',
  protocol: 'https',
  baseUrl: 'https://hmhsmap.edgeone.dev',
  // Permanent Read-Only Shared Preview Link (Guaranteed safe from edits/tampering)
  readOnlySharedUrl: 'https://ais-pre-dhf4vzkhgkboi775en5ol5-1019729835090.asia-southeast1.run.app',
  readOnlyCustomDomainUrl: 'https://hmhsmap.edgeone.dev/',
  appName: 'HMHS Map',
  tagline: 'Real-Time Global GPS, Live Navigation & Scenic Green Routes',
  sitemapUrl: 'https://hmhsmap.edgeone.dev/sitemap.xml',
  robotsUrl: 'https://hmhsmap.edgeone.dev/robots.txt',
  ogImageUrl: 'https://hmhsmap.edgeone.dev/og-preview.png',
  
  // Helper to generate shareable links for locations/routes on hmhsmap.edgeone.dev
  getShareableUrl: (lat?: number, lng?: number, query?: string) => {
    const base = 'https://hmhsmap.edgeone.dev/';
    const params = new URLSearchParams();
    if (lat !== undefined && lng !== undefined) {
      params.set('lat', lat.toFixed(5));
      params.set('lng', lng.toFixed(5));
    }
    if (query) {
      params.set('q', query);
    }
    const str = params.toString();
    return str ? `${base}?${str}` : base;
  },

  // Get the direct read-only link for view-only users
  getReadOnlyUrl: () => {
    return 'https://ais-pre-dhf4vzkhgkboi775en5ol5-1019729835090.asia-southeast1.run.app';
  },

  // Helper to check if current window hostname matches target edge domain
  isEdgeDomain: () => {
    if (typeof window === 'undefined') return false;
    return window.location.hostname.includes('hmhsmap.edgeone.dev') || window.location.hostname.includes('edgeone');
  }
};

