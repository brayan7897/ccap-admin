import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { getSession, signOut } from "next-auth/react";
import { toast } from "sonner";
import { API_URL } from "@/lib/config";

const BASE_URL = API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

import type { Session } from "next-auth";

// Promise caché para evitar múltiples peticiones /api/auth/session simultáneas
let sessionPromise: Promise<Session | null> | null = null;

// ── Request interceptor: inject NextAuth session JWT ─────────────────────────
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    if (!sessionPromise) {
      sessionPromise = getSession().finally(() => {
        // Limpiamos la caché en 1 segundo para que peticiones futuras obtengan datos frescos
        setTimeout(() => {
          sessionPromise = null;
        }, 1000);
      });
    }
    const session = await sessionPromise;
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return config;
});

// ── Response interceptor: handle 401 ─────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ detail: string; type?: string }>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const body = error.response.data;

      // Distinguish between a displaced session vs. a plain auth failure
      if (body?.type === "SessionInvalid") {
        // The backend invalidated this session (new login from another device)
        toast.error(
          "Tu sesión expiró o iniciaste sesión en otro dispositivo.",
          { id: "session-invalid", duration: 5000 },
        );
        await signOut({ redirect: false });
        window.location.href = "/login?reason=session_displaced";
      } else {
        // Generic 401 (expired JWT, etc.) — silently redirect
        await signOut({ redirect: false });
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Calls the backend logout endpoint to revoke the current session in Redis
 * and mark it as inactive in PostgreSQL.
 *
 * @remarks Must be called BEFORE `signOut()` so the Authorization header
 * is still available.
 */
export async function apiLogout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch {
    // Ignore errors — the local NextAuth session will be cleared regardless
  }
}
