import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { authApi } from '../api';
import {
  getAccessToken,
  setAccessToken,
  refreshAccessToken,
  setOnAuthFailure,
} from '../api/client';
import type { JwtPayload, User } from '../types';

interface AuthContextValue {
  user: User | null;
  permissions: string[];
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, fullName: string, accountType?: 'parent' | 'applicant') => Promise<User>;
  logout: () => Promise<void>;
  hasPermission: (perm: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeToken(token: string): { permissions: string[]; role: string } {
  try {
    const payload = jwtDecode<JwtPayload>(token);
    return { permissions: payload.permissions || [], role: payload.role };
  } catch {
    return { permissions: [], role: 'GUEST' };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    setPermissions([]);
    setRole(null);
  }, []);

  const applyToken = useCallback((token: string, u: User) => {
    setAccessToken(token);
    const decoded = decodeToken(token);
    const apiPermissions = u.permissions ?? [];
    const jwtPermissions = decoded.permissions ?? [];
    setUser(u);
    setPermissions(apiPermissions.length > 0 ? apiPermissions : jwtPermissions);
    setRole(decoded.role || u.role || null);
  }, []);

  useEffect(() => {
    setOnAuthFailure(clearAuth);
    return () => setOnAuthFailure(null);
  }, [clearAuth]);

  useEffect(() => {
    async function bootstrapAuth() {
      const token = getAccessToken();
      if (token) {
        try {
          const { data } = await authApi.me();
          applyToken(token, data);
          return;
        } catch {
          clearAuth();
        }
      }

      try {
        const newToken = await refreshAccessToken();
        const { data } = await authApi.me();
        applyToken(newToken, data);
      } catch {
        clearAuth();
      }
    }

    bootstrapAuth().finally(() => setLoading(false));
  }, [applyToken, clearAuth]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data } = await authApi.login({ email, password });
      applyToken(data.accessToken, data.user);
      return data.user;
    },
    [applyToken],
  );

  const register = useCallback(
    async (email: string, password: string, fullName: string, accountType: 'parent' | 'applicant' = 'parent') => {
      const { data } = await authApi.register({
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
        accountType,
      });
      applyToken(data.accessToken, data.user);
      return data.user;
    },
    [applyToken],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      permissions,
      role,
      loading,
      login,
      register,
      logout,
      hasPermission: (perm: string) => {
        if (role === 'SUPER_ADMIN' || role === 'ADMIN') return true;
        return permissions.includes(perm);
      },
      isAdmin:
        role === 'ADMIN' ||
        role === 'SUPER_ADMIN' ||
        role === 'TEACHER' ||
        role === 'HR',
    }),
    [user, permissions, role, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
