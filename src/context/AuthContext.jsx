// // src/context/AuthContext.jsx
// import { createContext, useEffect, useMemo, useState } from "react";
// import AuthService from "../Services/AuthService.js";
// import api from "../api/axios.js";
// import { parseJwt, isTokenExpired } from "../utils/jwt.jsx";

// export const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [loading, setLoading] = useState(true);
//   const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);
//   const user = useMemo(() => (accessToken ? parseJwt(accessToken) : null), [accessToken]);

//   useEffect(() => {
//     // setear header por si refrescan la página
//     if (accessToken) {
//       api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
//     } else {
//       delete api.defaults.headers.common["Authorization"];
//     }
//     setLoading(false);
//   }, [accessToken]);

//   const isAuthenticated = !!accessToken && !isTokenExpired(accessToken);

//   const login = async ({ email, password, totp }) => {
//     const data = await AuthService.login({ email, password, totp });
//     if (data?.accessToken) {
//       setAccessToken(data.accessToken);
//     }
//     return data;
//   };

//   const register = (payload) => AuthService.register(payload);

//   const logout = async () => {
//     await AuthService.logout();
//     setAccessToken(null);
//   };

//   const value = { isAuthenticated, loading, user, login, logout, register };
//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }


// src/context/AuthContext.jsx
// src/context/AuthContext.jsx
// src/context/AuthContext.jsx
import { createContext, useEffect, useMemo, useState } from "react";
import AuthService from "../Services/AuthService.js";
import api from "../api/axios.js";
import { parseJwt, isTokenExpired } from "../utils/jwt.jsx";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("accessToken") || null);

  const user = useMemo(() => {
    if (!accessToken || isTokenExpired(accessToken)) return null;
    return parseJwt(accessToken);
  }, [accessToken]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.debug("[AuthContext.init] VITE_API_URL_BACKEND =", import.meta.env.VITE_API_URL_BACKEND);
        const at = localStorage.getItem("accessToken");
        const rt = localStorage.getItem("refreshToken");

        if (at && !isTokenExpired(at)) {
          api.defaults.headers.common["Authorization"] = `Bearer ${at}`;
          setAccessToken(at);
          console.debug("[AuthContext.init] Access válido, no refresco");
          return;
        }

        if (rt) {
          console.debug("[AuthContext.init] FORZANDO refresh con RT presente");
          const data = await AuthService.refreshAccessToken();
          if (data?.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
            if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
            setAccessToken(data.accessToken);
            console.debug("[AuthContext.init] Refresh OK");
            return;
          }
        }

        console.debug("[AuthContext.init] No RT o refresh falló → sesión nula");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("auth_email");
        delete api.defaults.headers.common["Authorization"];
      } catch (e) {
        console.debug("[AuthContext.init] Refresh lanzó error:", e?.message);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("auth_email");
        delete api.defaults.headers.common["Authorization"];
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (accessToken && !isTokenExpired(accessToken)) {
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [accessToken]);

  const isAuthenticated = !!user;

  const login = async ({ email, password, totp }) => {
    const data = await AuthService.login({ email, password, totp });
    if (data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
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
