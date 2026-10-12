/**
 * Admin Portal Central Configuration
 * Dynamically driven by environment variables with fallback to local development.
 */

export const API_BASE_URL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const WS_BASE_URL: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
