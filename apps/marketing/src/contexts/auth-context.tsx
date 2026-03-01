"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@ecommerce/shared-types";
import { API_URL } from "@/lib/api-client";
const AUTH_STORAGE_KEY = "auth_tokens";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  getAccessToken: () => string | null;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

function getStoredTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
  } catch {
    console.error("Failed to save auth tokens");
  }
}

function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async (accessToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        return data.data as User;
      }
    } catch {
      console.error("Failed to fetch user");
    }
    return null;
  }, []);

  const refreshTokens = useCallback(async (refreshToken: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.data as AuthTokens;
      }
    } catch {
      console.error("Failed to refresh tokens");
    }
    return null;
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const tokens = getStoredTokens();
      if (!tokens) {
        setIsLoading(false);
        return;
      }

      let currentUser = await fetchUser(tokens.accessToken);
      
      if (!currentUser) {
        const newTokens = await refreshTokens(tokens.refreshToken);
        if (newTokens) {
          saveTokens(newTokens);
          currentUser = await fetchUser(newTokens.accessToken);
        }
      }

      setUser(currentUser);
      setIsLoading(false);
    };

    initAuth();
  }, [fetchUser, refreshTokens]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Sign in failed" };
      }

      saveTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      setUser(data.data.user);
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const signUp = useCallback(async (signUpData: SignUpData) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData),
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Sign up failed" };
      }

      saveTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      setUser(data.data.user);
      return { success: true };
    } catch {
      return { success: false, error: "Network error" };
    }
  }, []);

  const signOut = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const getAccessToken = useCallback(() => {
    const tokens = getStoredTokens();
    return tokens?.accessToken ?? null;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
