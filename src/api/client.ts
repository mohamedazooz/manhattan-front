import axios from 'axios';
import { API_URL } from '../lib/utils';

const TOKEN_STORAGE_KEY = 'mls_access_token';

let accessToken: string | null = null;
let onAuthFailure: (() => void) | null = null;

function readStoredToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setOnAuthFailure(handler: (() => void) | null) {
  onAuthFailure = handler;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // sessionStorage may be unavailable in some contexts
  }
}

export function getAccessToken() {
  if (accessToken) return accessToken;
  const stored = readStoredToken();
  if (stored) {
    accessToken = stored;
  }
  return accessToken;
}

function clearAccessToken() {
  accessToken = null;
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export async function refreshAccessToken(): Promise<string> {
  refreshPromise ??= axios
    .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true, timeout: 10000 })
    .then((res) => {
      accessToken = res.data.accessToken;
      return res.data.accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

let refreshPromise: Promise<string> | null = null;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        clearAccessToken();
        onAuthFailure?.();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export function langParam(lang?: string) {
  return lang === 'ar' ? 'ar' : 'en';
}
