// Configuration management for different environments
// Load from .env.local (development) or .env.prod (production)

export const getApiBaseUrl = (): string => {
  // In browser, use window.location.origin if no env var
  if (typeof window !== 'undefined') {
    // Client-side: use relative URLs or NEXT_PUBLIC variables
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
  }

  // Server-side: use environment variables
  return process.env.API_BASE_URL || 'http://localhost:5001';
};

export const config = {
  apiBaseUrl: getApiBaseUrl(),
  apiTimeout: 10000, // 10 seconds
  env: process.env.NODE_ENV || 'development',
};

export default config;
