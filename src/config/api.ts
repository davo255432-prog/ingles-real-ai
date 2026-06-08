/**
 * Base URL for all API calls.
 * - Development: http://localhost:3001  (set via .env.development)
 * - Production build served from Express: '' (relative URLs)
 */
export const API_BASE: string = import.meta.env.VITE_API_URL ?? '';
