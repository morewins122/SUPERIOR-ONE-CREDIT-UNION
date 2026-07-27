import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "@/lib/api";
import type { User } from "@/types";

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, twoFactorCode?: string, rememberMe?: boolean) => Promise<void>;
  register: (payload: { firstName: string; lastName: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "superior-one-demo-token";

const getStoredToken = () => sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);

const persistToken = (token: string, rememberMe: boolean) => {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
    return;
  }

  sessionStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(TOKEN_KEY);
};

const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    void (async () => {
      try {
        const { data } = await api.get<User>("/auth/me");
        setUser(data);
      } catch {
        setUser(null);
        setToken(null);
        clearStoredToken();
      }
    })();
  }, [token]);

  const login = async (email: string, password: string, twoFactorCode?: string, rememberMe = true) => {
    setLoading(true);
    try {
      const { data } = await api.post<{ user: User; token: string }>("/auth/login", { email, password, twoFactorCode });
      setUser(data.user);
      setToken(data.token);
      persistToken(data.token, rememberMe);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      await api.post("/auth/register", payload);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    setToken(null);
    clearStoredToken();
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
