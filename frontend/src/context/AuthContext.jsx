import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAccessToken } from '../api/axiosInstance';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshSession().finally(() => setLoading(false));
  }, []);

  const refreshSession = async () => {
    try {
      const res = await api.post('/auth/token/refresh/');
      setAccessToken(res.data.access);
      const me = await api.get('/auth/me/');
      setUser(me.data);
      return me.data;
    } catch {
      setUser(null);
      setAccessToken(null);
      return null;
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login/', { email, password });
    setAccessToken(res.data.access);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);