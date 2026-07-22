const env = (import.meta as unknown as { env?: Record<string, string> }).env;
const url = env?.VITE_API_BASE_URL || "http://localhost:8084";

export const API_BASE_URL = new URL(url.endsWith("/") ? url : `${url}/`);
