export const DEFAULT_SITE_URL = 'https://vaibhavgrand.in';

/**
 * Single source of truth for the canonical website domain.
 * Reads import.meta.env.VITE_SITE_URL if defined, defaulting to https://vaibhavgrand.in (no trailing slash).
 */
export const SITE_URL: string = (
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SITE_URL
    ? import.meta.env.VITE_SITE_URL
    : DEFAULT_SITE_URL
).replace(/\/+$/, '');
