import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../api';
import { clearAllTestAccessVerified } from '../utils/testAccessSession';

const AuthContext = createContext(null);
const TOKEN_KEY = 'dm_token';
const LEGACY_TOKEN_KEY = 'token';

function readStoredToken() {
  const dm = localStorage.getItem(TOKEN_KEY);
  if (dm) return dm;
  const legacy = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacy) {
    localStorage.setItem(TOKEN_KEY, legacy);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    return legacy;
  }
  return null;
}

function parseJwtPayload(token) {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const json = atob(segment.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  clearAllTestAccessVerified();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => readStoredToken());
  const [loading, setLoading] = useState(true);
  const authSessionRef = useRef(0);
  const tokenRef = useRef(token);
  const skipNextValidationLoading = useRef(false);
  tokenRef.current = token;

  const invalidateAuthRequests = useCallback(() => {
    authSessionRef.current += 1;
  }, []);

  const applyUserIfCurrent = useCallback((session, nextUser, activeToken) => {
    if (session !== authSessionRef.current) return;
    if (activeToken !== tokenRef.current) return;

    const payload = parseJwtPayload(activeToken);
    if (payload?.id != null && Number(payload.id) !== Number(nextUser?.id)) {
      return;
    }

    setUser(nextUser);
  }, []);

  const persist = useCallback((newToken, newUser) => {
    invalidateAuthRequests();
    clearStoredAuth();

    if (newToken) {
      localStorage.setItem(TOKEN_KEY, newToken);
      skipNextValidationLoading.current = true;
      tokenRef.current = newToken;
      setToken(newToken);
    }

    if (newUser) setUser(newUser);
    setLoading(false);
  }, [invalidateAuthRequests]);

  const logout = useCallback(() => {
    invalidateAuthRequests();
    clearStoredAuth();
    tokenRef.current = null;
    setToken(null);
    setUser(null);
    setLoading(false);
  }, [invalidateAuthRequests]);

  const syncTokenFromStorage = useCallback(() => {
    const stored = readStoredToken();
    if (stored === tokenRef.current) return;

    invalidateAuthRequests();
    if (!stored) {
      tokenRef.current = null;
      setToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    tokenRef.current = stored;
    setToken(stored);
  }, [invalidateAuthRequests]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== TOKEN_KEY && e.key !== LEGACY_TOKEN_KEY) return;
      syncTokenFromStorage();
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [syncTokenFromStorage]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') syncTokenFromStorage();
    };

    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [syncTokenFromStorage]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return undefined;
    }

    const session = authSessionRef.current;
    const activeToken = token;
    const skipLoading = skipNextValidationLoading.current;
    skipNextValidationLoading.current = false;

    if (!skipLoading) {
      setLoading(true);
      setUser(null);
    }

    const controller = new AbortController();
    let cancelled = false;

    authApi
      .me(activeToken, controller.signal)
      .then(({ user: u }) => {
        if (cancelled) return;
        applyUserIfCurrent(session, u, activeToken);
      })
      .catch((err) => {
        if (cancelled || session !== authSessionRef.current) return;
        if (err?.name === 'AbortError') return;
        if (activeToken !== tokenRef.current) return;
        logout();
      })
      .finally(() => {
        if (cancelled) return;
        if (session === authSessionRef.current) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [token, logout, applyUserIfCurrent]);

  const login = async (identifier, password) => {
    invalidateAuthRequests();
    setUser(null);
    const data = await authApi.login({ identifier, password });
    if (data.requires2FA) return data;
    persist(data.token, data.user);
    return data;
  };

  const verify2FA = async (tempToken, code) => {
    invalidateAuthRequests();
    setUser(null);
    const data = await authApi.verify2FA({ tempToken, code });
    persist(data.token, data.user);
    return data;
  };

  const register = async (payload) => {
    invalidateAuthRequests();
    setUser(null);
    const data = await authApi.register(payload);
    persist(data.token, data.user);
    return data;
  };

  const refreshUser = useCallback(async () => {
    const activeToken = tokenRef.current;
    if (!activeToken) return null;

    const session = authSessionRef.current;
    const { user: u } = await authApi.me(activeToken);
    applyUserIfCurrent(session, u, activeToken);
    return session === authSessionRef.current ? u : null;
  }, [applyUserIfCurrent]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        verify2FA,
        register,
        refreshUser,
        persist,
        logout,
        isAdmin: user?.role === 'admin',
        isUser: user?.role === 'user',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
