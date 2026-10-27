interface Env {
  ORS_API_KEY?: string;
  [key: string]: unknown;
}

interface EventContext {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
  waitUntil: (promise: Promise<unknown>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  data: Record<string, unknown>;
}

// Vaibhav Grand, Renigunta Coords
const RESTAURANT_COORDS = {
  lat: 13.6368,
  lng: 79.5039,
};

// Haversine straight-line distance calculation (in km)
function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

// Basic abuse protection: Origin/Referer header must match request host if present
function isAllowedOriginOrReferer(request: Request): boolean {
  const reqUrl = new URL(request.url);
  const reqHost = reqUrl.host.toLowerCase();

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const originHost = new URL(origin).host.toLowerCase();
      if (originHost !== reqHost) return false;
    } catch {
      return false;
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererHost = new URL(referer).host.toLowerCase();
      if (refererHost !== reqHost) return false;
    } catch {
      return false;
    }
  }

  return true;
}

export async function onRequestGet(context: EventContext): Promise<Response> {
  const { request, env } = context;

  // Basic abuse protection check
  if (!isAllowedOriginOrReferer(request)) {
    return new Response(
      JSON.stringify({ error: 'Forbidden: Origin or Referer host mismatch' }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  const url = new URL(request.url);
  const latParam = url.searchParams.get('lat');
  const lngParam = url.searchParams.get('lng');

  if (!latParam || !lngParam) {
    return new Response(
      JSON.stringify({ error: 'Missing lat or lng parameter' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  const rawLat = parseFloat(latParam);
  const rawLng = parseFloat(lngParam);

  // Validate finite numbers and geographical ranges
  if (
    !Number.isFinite(rawLat) ||
    !Number.isFinite(rawLng) ||
    rawLat < -90 ||
    rawLat > 90 ||
    rawLng < -180 ||
    rawLng > 180
  ) {
    return new Response(
      JSON.stringify({ error: 'Invalid coordinates: lat must be between -90 and 90, lng between -180 and 180' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  // Round coordinates to 4 decimal places for consistency and caching
  const userLat = Number(rawLat.toFixed(4));
  const userLng = Number(rawLng.toFixed(4));
  const mapsLink = `https://maps.google.com/?q=${userLat},${userLng}`;

  // Haversine straight-line distance
  const straightLineDist = calculateHaversineKm(
    RESTAURANT_COORDS.lat,
    RESTAURANT_COORDS.lng,
    userLat,
    userLng
  );

  // If straight-line distance > 8 km, user is definitely beyond the 5 km road delivery radius
  // Return immediately without consuming ORS quota
  if (straightLineDist > 8.0) {
    return new Response(
      JSON.stringify({
        eligible: false,
        distanceKm: straightLineDist,
        roadKm: null,
        mapsLink,
        source: 'haversine',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  const createFallbackResponse = (distKm: number): Response => {
    const eligible = distKm > 0 && distKm <= 3.8;
    return new Response(
      JSON.stringify({
        eligible,
        distanceKm: distKm,
        roadKm: distKm,
        mapsLink,
        source: 'haversine',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  };

  // Read key ONLY from context.env.ORS_API_KEY
  const apiKey = typeof env.ORS_API_KEY === 'string' ? env.ORS_API_KEY.trim() : '';

  if (!apiKey || apiKey.includes('your-openrouteservice')) {
    return createFallbackResponse(straightLineDist);
  }

  // Call OpenRouteService with 6-second AbortController timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    // CRITICAL ORS QUIRK: Coordinates must be [longitude, latitude]
    const orsUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${encodeURIComponent(
      apiKey
    )}&start=${RESTAURANT_COORDS.lng},${RESTAURANT_COORDS.lat}&end=${userLng},${userLat}&preference=shortest`;

    const orsResponse = await fetch(orsUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json, application/geo+json',
      },
    });
    clearTimeout(timeoutId);

    if (!orsResponse.ok) {
      return createFallbackResponse(straightLineDist);
    }

    const data = (await orsResponse.json()) as {
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
      const eligible = roadKm > 0 && roadKm <= 5.0; // Strictly 5.0 km road driving distance

      return new Response(
        JSON.stringify({
          eligible,
          distanceKm: roadKm,
          roadKm,
          mapsLink,
          source: 'ors',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300, s-maxage=600',
          },
        }
      );
    }

    return createFallbackResponse(straightLineDist);
  } catch {
    clearTimeout(timeoutId);
    return createFallbackResponse(straightLineDist);
  }
}
