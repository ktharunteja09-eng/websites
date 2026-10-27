/**
 * Global Error & Dynamic Chunk/JSON Handler
 * Intercepts route load failures caused by stale deployment manifests or chunk mismatches.
 * Reloads the page once using a sessionStorage guard to prevent infinite loops.
 */

const RELOAD_GUARD_KEY = 'vg_route_chunk_reloaded';

/**
 * Detects whether an error is caused by a JSON parsing error
 * (e.g. vite-react-ssg receiving HTML instead of JSON for static loader data)
 * or a failed dynamic module import / chunk load.
 */
export function isChunkOrJsonError(error: unknown): boolean {
  if (!error) return false;

  const errStr =
    error instanceof Error
      ? `${error.name} ${error.message} ${error.stack || ''}`
      : typeof error === 'string'
      ? error
      : typeof error === 'object'
      ? JSON.stringify(error)
      : String(error);

  const lower = errStr.toLowerCase();

  const isJsonParse =
    lower.includes("unexpected token '<'") ||
    lower.includes('unexpected token <') ||
    lower.includes('<!doctype') ||
    lower.includes('is not valid json') ||
    lower.includes('failed to parse json') ||
    lower.includes('json.parse') ||
    lower.includes("failed to execute 'json'");

  const isChunkLoad =
    lower.includes('failed to fetch dynamically imported module') ||
    lower.includes('loading chunk') ||
    lower.includes('loading css chunk') ||
    lower.includes('chunkloaderror') ||
    lower.includes('importing a module script failed') ||
    lower.includes('error loading dynamically imported module') ||
    lower.includes('preloaderror');

  return isJsonParse || isChunkLoad;
}

/**
 * Checks if a reload was already triggered in this session for a route load failure.
 */
export function hasAlreadyReloaded(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    if (sessionStorage.getItem(RELOAD_GUARD_KEY)) {
      return true;
    }
  } catch {
    // sessionStorage access blocked (e.g. strict private mode)
  }

  // Secondary guard: inspect performance navigation timing if sessionStorage was restricted
  try {
    const navEntries = performance.getEntriesByType?.('navigation') as PerformanceNavigationTiming[];
    if (navEntries && navEntries[0] && navEntries[0].type === 'reload') {
      return true;
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
  try {
    sessionStorage.setItem(RELOAD_GUARD_KEY, '1');
  } catch {
    // ignore
  }
}

/**
 * Clears the reload guard flag on successful navigation or route mount.
 */
export function clearReloadGuard(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(RELOAD_GUARD_KEY);
  } catch {
    // ignore
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
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

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
