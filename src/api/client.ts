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
  const { data } = await axios.post(
    `${API_URL}/auth/refresh`,
    {},
    { withCredentials: true },
  );
  accessToken = data.accessToken;
  return data.accessToken;
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
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

let refreshPromise: Promise<string> | null = null;

async function refreshAccessTokenInternal(): Promise<string> {
  refreshPromise ??= refreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        refreshPromise ??= refreshAccessTokenInternal();
        const token = await refreshPromise;
        refreshPromise = null;
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        refreshPromise = null;
        clearAccessToken();
        onAuthFailure?.();
      }
    }
    return Promise.reject(error);
  },
);

export function langParam(lang?: string) {
  return lang === 'ar' ? 'ar' : 'en';
}
