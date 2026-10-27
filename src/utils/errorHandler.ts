/**
 * Global Error & Dynamic Chunk/JSON Handler
 * Intercepts route load failures caused by stale deployment manifests or chunk mismatches.
 * Reloads the page once using a timestamped guard to prevent infinite loops.
 */

const RELOAD_GUARD_KEY = 'vg_route_chunk_reload_guard';
const COOLDOWN_MS = 15_000; // Minimum 15s between automated reloads to prevent infinite reload loops
const EXPIRY_MS = 60_000;   // After 60s, permit fresh recovery for independent future issues

interface ReloadRecord {
  timestamp: number;
  url: string;
}

let listenersInstalled = false;

// Safe storage access (handles private browsing / blocked storage)
function getStorageRecord(): ReloadRecord | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(RELOAD_GUARD_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed?.timestamp === 'number') {
        return parsed as ReloadRecord;
      }
    }
  } catch {
    // sessionStorage blocked or JSON parse failed; fall back to window.name
    try {
      if (window.name && window.name.startsWith('__vg_rg:')) {
        const parsed = JSON.parse(window.name.slice(8));
        if (typeof parsed?.timestamp === 'number') {
          return parsed as ReloadRecord;
        }
      }
    } catch {
      // ignore
    }
  }
  return null;
}

function setStorageRecord(record: ReloadRecord): void {
  if (typeof window === 'undefined') return;
  const serialized = JSON.stringify(record);

  try {
    sessionStorage.setItem(RELOAD_GUARD_KEY, serialized);
  } catch {
    // Fall back to window.name which persists across reloads in the same tab
    try {
      window.name = `__vg_rg:${serialized}`;
    } catch {
      // ignore
    }
  }
}

function removeStorageRecord(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(RELOAD_GUARD_KEY);
  } catch {
    // ignore
  }

  try {
    if (window.name && window.name.startsWith('__vg_rg:')) {
      window.name = '';
    }
  } catch {
    // ignore
  }
}

/**
 * Detects whether an error is caused by:
 * 1. A failed dynamic module import / chunk load (e.g. after a new deployment), OR
 * 2. An SSG manifest / static loader data fetch failure receiving HTML (404) instead of JSON.
 *
 * Explicitly excludes unrelated application API failures (Supabase, ORS, distance API, etc.).
 */
export function isChunkOrJsonError(error: unknown): boolean {
  if (!error) return false;

  const errStr =
    error instanceof Error
      ? `${error.name}: ${error.message}\n${error.stack || ''}`
      : typeof error === 'string'
      ? error
      : typeof error === 'object'
      ? JSON.stringify(error)
      : String(error);

  const lower = errStr.toLowerCase();

  // 1. Explicit dynamic script chunk & stylesheet preload failures
  const isChunkLoad =
    lower.includes('failed to fetch dynamically imported module') ||
    lower.includes('loading chunk') ||
    lower.includes('loading css chunk') ||
    lower.includes('chunkloaderror') ||
    lower.includes('importing a module script failed') ||
    lower.includes('error loading dynamically imported module') ||
    lower.includes('unable to preload') ||
    lower.includes('preload css') ||
    lower.includes('preloaderror');

  if (isChunkLoad) {
    return true;
  }

  // 2. SSG manifest & static loader data errors
  const isManifestOrStaticLoader =
    lower.includes('static-loader-data-manifest') ||
    lower.includes('static-loader-data');

  if (isManifestOrStaticLoader) {
    return true;
  }

  // 3. JSON parse error detection - only for SSG / router loader context, NOT application APIs
  const isJsonParse =
    lower.includes("unexpected token '<'") ||
    lower.includes('unexpected token <') ||
    lower.includes('<!doctype') ||
    lower.includes('is not valid json') ||
    lower.includes('failed to parse json') ||
    lower.includes('json.parse') ||
    lower.includes("failed to execute 'json'");

  if (!isJsonParse) {
    return false;
  }

  // Exclude known application APIs (Supabase, backend routes, ORS)
  const isUnrelatedApiError =
    lower.includes('/api/') ||
    lower.includes('supabase') ||
    lower.includes('openrouteservice') ||
    lower.includes('route-distance') ||
    lower.includes('delivery-verify');

  if (isUnrelatedApiError) {
    return false;
  }

  // If it's a JSON parse error, confirm it originated from SSG loader, React Router, or router hydration
  const isRouterOrSsgContext =
    lower.includes('transformstaticloaderroute') ||
    lower.includes('vite-react-ssg') ||
    lower.includes('@remix-run/router') ||
    lower.includes('react-router') ||
    lower.includes('route.loader') ||
    lower.includes('routercontext') ||
    lower.includes('loaderdata');

  return isRouterOrSsgContext;
}

/**
 * Checks if a recovery reload was already triggered recently for a chunk/manifest failure.
 * Implements:
 * 1. Cooldown window (15s): prevents rapid infinite reload loops.
 * 2. Auto-expiry (60s): allows future recovery if an independent chunk mismatch occurs later.
 * 3. Fallback to performance navigation timing if storage is restricted.
 */
export function hasAlreadyReloaded(): boolean {
  if (typeof window === 'undefined') return false;

  const record = getStorageRecord();
  if (record) {
    const elapsed = Date.now() - record.timestamp;
    // Within cooldown: definitely block reload to prevent loops
    if (elapsed < COOLDOWN_MS) {
      return true;
    }
    // Between cooldown and expiry: if on the exact same URL, block reload
    if (elapsed < EXPIRY_MS && record.url === window.location.href) {
      return true;
    }
    // Expired: allow fresh recovery attempt
    removeStorageRecord();
  }

  // Secondary check: inspect performance navigation timing only if reload just occurred
  try {
    const navEntries = performance.getEntriesByType?.('navigation') as PerformanceNavigationTiming[];
    if (navEntries && navEntries[0] && navEntries[0].type === 'reload') {
      if (performance.now() < COOLDOWN_MS) {
        return true;
      }
    }
  } catch {
    // ignore
  }

  return false;
}

/**
 * Marks that a reload has been initiated to prevent infinite reload loops.
 */
export function markReloaded(): void {
  if (typeof window === 'undefined') return;
  setStorageRecord({
    timestamp: Date.now(),
    url: window.location.href,
  });
}

/**
 * Clears the reload guard flag on successful navigation or route mount,
 * only after the minimum cooldown has passed to ensure the page is stable.
 */
export function clearReloadGuard(force: boolean = false): void {
  if (typeof window === 'undefined') return;

  if (force) {
    removeStorageRecord();
    return;
  }

  const record = getStorageRecord();
  if (!record) return;

  // Do not clear immediately on initial mount if reload was triggered < 10s ago
  // to prevent rapid reload loops if a second error fires during initial render.
  const elapsed = Date.now() - record.timestamp;
  if (elapsed >= 10_000) {
    removeStorageRecord();
  }
}

/**
 * Attempts a single reload if the error matches chunk/JSON parse failure and
 * has not already reloaded once.
 * Returns true if reload was triggered, false otherwise.
 */
export function attemptReloadOnce(reason: unknown): boolean {
  if (typeof window === 'undefined') return false;

  if (isChunkOrJsonError(reason) && !hasAlreadyReloaded()) {
    markReloaded();
    window.location.reload();
    return true;
  }

  return false;
}

/**
 * Installs global event listeners on window to capture unhandled rejections,
 * uncaught script errors, and Vite preload chunk errors.
 * Guaranteed to install only once.
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined' || listenersInstalled) return;
  listenersInstalled = true;

  // 1. Unhandled promise rejections (async loader / fetch json rejections)
  window.addEventListener('unhandledrejection', (event) => {
    if (attemptReloadOnce(event.reason)) {
      event.preventDefault();
    }
  });

  // 2. Global script errors
  window.addEventListener('error', (event) => {
    if (attemptReloadOnce(event.error || event.message)) {
      event.preventDefault();
    }
  });

  // 3. Vite chunk preload errors
  window.addEventListener('vite:preloadError', (event) => {
    const errorPayload = event.payload || (event as unknown as { detail?: unknown })?.detail || event;
    if (attemptReloadOnce(errorPayload)) {
      event.preventDefault();
    }
  });
}
