"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccessToken } from "@/lib/api";
import {
  type AuthResponse,
  type AuthUser,
  fetchCurrentUser,
  googleAuth,
  loginUser,
  logoutUser,
  registerUser,
  verifyUser,
} from "@/lib/auth";

// Cached under this key so the rest of the dashboard can read the session from
// the React Query cache once the pages go live.
const ME_QUERY_KEY = ["auth", "me"] as const;

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (
    email: string,
    password: string,
    persist?: boolean,
  ) => Promise<AuthResponse>;
  register: (input: RegisterInput) => Promise<AuthResponse>;
  verifyOtp: (userId: string, otp: string) => Promise<AuthResponse>;
  loginWithGoogleCode: (code: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [hasToken, setHasToken] = useState(() => !!getAccessToken());

  // Hydrate the session from the stored access token. The query stays disabled
  // until a token exists so an anonymous visitor never calls /users/me.
  const { data: user, isLoading } = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchCurrentUser,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const rememberUser = useCallback(
    (next: AuthUser | null) => {
      if (next) {
        queryClient.setQueryData(ME_QUERY_KEY, next);
      } else {
        queryClient.removeQueries({ queryKey: ME_QUERY_KEY });
      }
    },
    [queryClient],
  );

  const login = useCallback(
    async (email: string, password: string, persist = true) => {
      const res = await loginUser(email, password, persist);
      setHasToken(!!getAccessToken());
      if (res.user) rememberUser(res.user);
      return res;
    },
    [rememberUser],
  );

  const register = useCallback(
    async (input: RegisterInput) => registerUser(input),
    [],
  );

  const verifyOtp = useCallback(
    async (userId: string, otp: string) => {
      const res = await verifyUser(userId, otp);
      setHasToken(!!getAccessToken());
      if (res.user) rememberUser(res.user);
      return res;
    },
    [rememberUser],
  );

  const loginWithGoogleCode = useCallback(
    async (code: string) => {
      const res = await googleAuth(code);
      setHasToken(!!getAccessToken());
      if (res.user) rememberUser(res.user);
      return res;
    },
    [rememberUser],
  );

  const logout = useCallback(async () => {
    await logoutUser();
    setHasToken(false);
    rememberUser(null);
  }, [rememberUser]);

  const status: AuthStatus = !hasToken
    ? "unauthenticated"
    : isLoading
      ? "loading"
      : user
        ? "authenticated"
        : "unauthenticated";

  const value = useMemo(
    () => ({
      user: user ?? null,
      status,
      login,
      register,
      verifyOtp,
      loginWithGoogleCode,
      logout,
    }),
    [user, status, login, register, verifyOtp, loginWithGoogleCode, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
