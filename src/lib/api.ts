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
        // Cache the session promise for 30s — JWT doesn't change between requests.
        // This prevents duplicate /api/auth/session calls when multiple useQuery
        // hooks fire simultaneously on component mount.
        setTimeout(() => {
          sessionPromise = null;
        }, 30_000);
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
 * Extract a display-friendly message from an axios error, regardless of
 * which of the two shapes the API's `detail` field comes back as:
 *   - a plain string, for domain errors raised as HTTPException(detail="...")
 *   - a pydantic validation-error array (`[{ msg, loc, type, ... }]`), for a
 *     422 raised by FastAPI itself before the request ever reaches our code
 *     (e.g. a password that fails the strength check on CreateUserRequest).
 * Without this, toasting `error.response.data.detail` directly renders the
 * array case as "[object Object]" instead of the actual validation message.
 */
export function getErrorDetail(error: unknown, fallback: string): string {
  const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data
    ?.detail;
  if (typeof detail === "string" && detail) return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const messages = detail
      .map((e) => (typeof e?.msg === "string" ? e.msg.replace(/^Value error,\s*/, "") : null))
      .filter((m): m is string => !!m);
    if (messages.length > 0) return messages.join(" ");
  }
  return fallback;
}

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
