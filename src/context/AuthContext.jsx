import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('warehouse_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('warehouse_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await authService.me();
        const nextUser = response.data?.data || null;
        setUser(nextUser);
        localStorage.setItem('warehouse_user', JSON.stringify(nextUser));
      } catch {
        localStorage.removeItem('warehouse_token');
        localStorage.removeItem('warehouse_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token]);

  const login = async (payload) => {
    const response = await authService.login(payload);
    const nextToken = response.data.token;
    const nextUser = response.data.user;
    localStorage.setItem('warehouse_token', nextToken);
    localStorage.setItem('warehouse_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('warehouse_token');
      localStorage.removeItem('warehouse_user');
      setToken(null);
      setUser(null);
    }
  };

  const value = useMemo(() => ({
    token,
    user,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(token),
    roles: user?.roles?.map((item) => item.name) ?? [],
  }), [loading, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
