import { useEffect, useMemo, useState } from "react";
import { getMe, login as loginRequest, logout as logoutRequest } from "../api/authApi";
import { AuthContext } from "./authContextObject";
import {
  clearSessionTokens,
  getRefreshToken,
  hasSessionTokens,
  setSessionTokens,
} from "../api/session";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!hasSessionTokens()) {
        if (active) {
          setInitializing(false);
        }
        return;
      }
      try {
        const response = await getMe();
        if (active) {
          setUser(response.data);
        }
      } catch {
        clearSessionTokens();
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setInitializing(false);
        }
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      setUser,
      async login(credentials) {
        const response = await loginRequest(credentials);
        const accessToken = response?.data?.accessToken;
        const refreshToken = response?.data?.refreshToken;
        if (!accessToken || !refreshToken) {
          throw new Error("Missing auth token response");
        }
        setSessionTokens(accessToken, refreshToken);
        setUser(response?.data?.user || null);
        return response;
      },
      async logout() {
        const refreshToken = getRefreshToken();
        try {
          if (refreshToken) {
            await logoutRequest({ refresh_token: refreshToken });
          }
        } catch {
          // Ignore logout call errors because local state is source of truth.
        } finally {
          clearSessionTokens();
          setUser(null);
        }
      },
      clearAuth() {
        clearSessionTokens();
        setUser(null);
      },
      async reloadUser() {
        const response = await getMe();
        setUser(response.data);
        return response.data;
      },
    }),
    [initializing, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
