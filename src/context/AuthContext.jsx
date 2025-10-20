// src/context/AuthContext.jsx
import { createContext, useEffect, useMemo, useState } from "react";
import AuthService from "../Services/AuthService.js";
import api from "../api/axios.js";
import { parseJwt, isTokenExpired } from "../utils/jwt.jsx";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
  const user = useMemo(() => (accessToken ? parseJwt(accessToken) : null), [accessToken]);

  useEffect(() => {
    // setear header por si refrescan la página
    if (accessToken) {
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
    setLoading(false);
  }, [accessToken]);

  const isAuthenticated = !!accessToken && !isTokenExpired(accessToken);

  const login = async ({ email, password, totp }) => {
    const data = await AuthService.login({ email, password, totp });
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
    }
    return data;
  };

  const register = (payload) => AuthService.register(payload);

  const logout = async () => {
    await AuthService.logout();
    setAccessToken(null);
  };

  const value = { isAuthenticated, loading, user, login, logout, register };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
