import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';

function routeDistancePlugin(env: Record<string, string>): Plugin {
  return {
    name: 'route-distance-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/route-distance', async (req, res) => {
        try {
          const host = req.headers.host || 'localhost:3000';
          const protocol = req.headers['x-forwarded-proto'] || 'http';
          const fullUrl = new URL(req.url || '', `${protocol}://${host}`);
          const latParam = fullUrl.searchParams.get('lat');
          const lngParam = fullUrl.searchParams.get('lng');

          if (!latParam || !lngParam) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.end(JSON.stringify({ error: 'Missing lat or lng parameter' }));
            return;
          }

          const rawLat = parseFloat(latParam);
          const rawLng = parseFloat(lngParam);
          if (
            !Number.isFinite(rawLat) ||
            !Number.isFinite(rawLng) ||
            rawLat < -90 ||
            rawLat > 90 ||
            rawLng < -180 ||
            rawLng > 180
          ) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.end(JSON.stringify({ error: 'Invalid coordinates' }));
            return;
          }

          const userLat = Number(rawLat.toFixed(4));
          const userLng = Number(rawLng.toFixed(4));
          const mapsLink = `https://maps.google.com/?q=${userLat},${userLng}`;

          const storeLat = 13.6368;
          const storeLng = 79.5039;
          const toRad = (deg: number) => (deg * Math.PI) / 180;
          const R = 6371;
          const dLat = toRad(userLat - storeLat);
          const dLon = toRad(userLng - storeLng);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(storeLat)) * Math.cos(toRad(userLat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const straightLineDist = Number((R * c).toFixed(2));

          const fallbackResponse = (distKm: number) => {
            const eligible = distKm > 0 && distKm <= 3.8;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.end(
              JSON.stringify({
                eligible,
                distanceKm: distKm,
                roadKm: distKm,
                mapsLink,
                source: 'haversine',
              })
            );
          };

          if (straightLineDist > 8.0) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.end(
              JSON.stringify({
                eligible: false,
                distanceKm: straightLineDist,
                roadKm: null,
                mapsLink,
                source: 'haversine',
              })
            );
            return;
          }

          const apiKey = (env.ORS_API_KEY || process.env.ORS_API_KEY || env.VITE_ORS_API_KEY || '').trim();
          if (!apiKey || apiKey.includes('your-openrouteservice')) {
            fallbackResponse(straightLineDist);
            return;
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          try {
            const orsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${encodeURIComponent(
              apiKey
            )}&start=${storeLng},${storeLat}&end=${userLng},${userLat}&preference=shortest`;
            const orsRes = await fetch(orsUrl, {
              signal: controller.signal,
              headers: { Accept: 'application/json, application/geo+json' },
            });
            clearTimeout(timeoutId);

            if (!orsRes.ok) {
              fallbackResponse(straightLineDist);
              return;
            }

            const data = (await orsRes.json()) as {
              features?: Array<{
                properties?: {
                  summary?: { distance?: number };
                  segments?: Array<{ distance?: number }>;
                };
              }>;
            };

            const distanceMeters =
              data?.features?.[0]?.properties?.summary?.distance ??
              data?.features?.[0]?.properties?.segments?.[0]?.distance;

            if (typeof distanceMeters === 'number') {
              const roadKm = Number((distanceMeters / 1000).toFixed(2));
              const eligible = roadKm > 0 && roadKm <= 5.0;
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
              res.end(
                JSON.stringify({
                  eligible,
                  distanceKm: roadKm,
                  roadKm,
                  mapsLink,
                  source: 'ors',
                })
              );
              return;
            }

            fallbackResponse(straightLineDist);
          } catch {
            clearTimeout(timeoutId);
            fallbackResponse(straightLineDist);
          }
        } catch {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), routeDistancePlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    ssgOptions: {
      script: 'async',
      formatting: 'none',
      dirStyle: 'nested',
      mock: true,
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              if (id.includes('lenis')) {
                return 'vendor-lenis';
              }
              if (id.includes('motion')) {
                return 'vendor-motion';
              }
            }
          },
        },
      },
    },
  };
});
