const env = (import.meta as any).env;
const url = env ? env.VITE_API_BASE_URL : null;

if (!url) {
  throw new Error("VITE_API_BASE_URL environment variable is required but not provided.");
}

export const API_BASE_URL = new URL(url.endsWith("/") ? url : `${url}/`);
