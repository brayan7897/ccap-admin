import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import { getSession, signOut } from "next-auth/react";
import { toast } from "sonner";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Request interceptor: inject NextAuth session JWT ─────────────────────────
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const session = await getSession();
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
    console.warn("[apiLogout] Backend logout request failed (non-critical).");
  }
}
