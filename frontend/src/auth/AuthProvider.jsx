import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "authToken";

function safeLowerRole(role) {
  return String(role || "").toLowerCase();
}

export function AuthProvider({ children, api }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authApi = api;

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        if (!token) {
          if (!mounted) return;
          setUser(null);
          return;
        }
        const me = await authApi.me(token);
        if (!mounted) return;
        setUser(me);
      } catch (e) {
        if (!mounted) return;
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    init();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => {
    return {
      token,
      user,
      loading,
      error,
      login: async (email, password) => {
        setError(null);
        const result = await authApi.login(email, password);
        localStorage.setItem(TOKEN_KEY, result.token);
        setToken(result.token);
        setUser(result.user);
        return result;
      },
      register: async ({ name, email, password, dob, profilePic }) => {
        setError(null);
        const result = await authApi.register({ name, email, password, dob, profilePic });
        localStorage.setItem(TOKEN_KEY, result.token);
        setToken(result.token);
        setUser(result.user);
        return result;
      },
      logout: async () => {
        setError(null);
        try {
          if (token) await authApi.logout(token);
        } finally {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      },
    };
  }, [authApi, token, user, loading, error]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

