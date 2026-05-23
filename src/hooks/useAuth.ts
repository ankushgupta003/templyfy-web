import {
  createElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, clearStoredToken, getStoredToken, setStoredToken, type AdminUser, type AuthResponse } from "../lib/api";

type AuthContextValue = {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: { email: string; password: string }) => Promise<AuthResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["auth", "me", token],
    queryFn: async () => {
      const response = await api.get<AdminUser>("/auth/me");
      return response.data;
    },
    enabled: Boolean(token),
    retry: false,
  });

  useEffect(() => {
    if (userQuery.isError && token) {
      clearStoredToken();
      setToken(null);
      queryClient.removeQueries({ queryKey: ["auth"] });
    }
  }, [queryClient, token, userQuery.isError]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: userQuery.data ?? null,
      token,
      isAuthenticated: Boolean(token && userQuery.data),
      isLoading: Boolean(token) && userQuery.isLoading,
      login: async (payload) => {
        const response = await api.post<AuthResponse>("/auth/login", payload);
        setStoredToken(response.data.token);
        setToken(response.data.token);
        await queryClient.invalidateQueries({ queryKey: ["auth"] });
        return response.data;
      },
      logout: () => {
        clearStoredToken();
        setToken(null);
        queryClient.removeQueries({ queryKey: ["auth"] });
      },
    }),
    [queryClient, token, userQuery.data, userQuery.isLoading],
  );

  return createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
