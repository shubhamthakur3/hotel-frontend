"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { auth as authApi, setAccessToken, clearAccessToken } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Try restoring session on mount (via refresh cookie) ──────────────

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await authApi.refresh();
        setAccessToken(data.access_token);
        // Refresh doesn't return user data, so we fetch profile
        const { default: api } = await import("@/lib/api");
        const profileRes = await api.get("/users/profile");
        setUser(profileRes.data);
      } catch {
        // No valid session — user not logged in
        clearAccessToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    setAccessToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  // ─── Signup ───────────────────────────────────────────────────────────

  const signup = useCallback(async (name, email, password, confirmPassword, role = "GUEST") => {
    const { data } = await authApi.signup({
      name,
      email,
      password,
      confirm_password: confirmPassword,
      roles: [role],
    });
    setAccessToken(data.access_token);
    setUser(data.user);
    return data.user;
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      clearAccessToken();
      setUser(null);
    }
  }, []);

  // ─── Role Helpers ─────────────────────────────────────────────────────

  const hasRole = useCallback(
    (role) => user?.roles?.includes(role) ?? false,
    [user]
  );

  const isCustomer = user?.roles?.includes("GUEST") ?? false;
  const isManager = user?.roles?.includes("HOTEL_MANAGER") ?? false;
  const isAdmin = user?.roles?.includes("ADMIN") ?? false;
  const isStaff = isManager || isAdmin;
  const isAuthenticated = !!user;

  const value = {
    user,
    isLoading,
    isAuthenticated,
    isCustomer,
    isManager,
    isAdmin,
    isStaff,
    login,
    signup,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
