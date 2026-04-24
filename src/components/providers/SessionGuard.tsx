"use client";

/**
 * SessionGuard
 *
 * Runs inside the authenticated dashboard layout and periodically verifies
 * that the current session is still valid in Redis. If the backend returns a
 * 401 with `type: "SessionInvalid"` the user is signed-out locally and
 * redirected to the login page.
 *
 * Polling is paused when the browser tab is hidden to avoid unnecessary
 * requests, and is stopped entirely on unmount.
 */

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { getSession } from "next-auth/react";
import { toast } from "sonner";

const POLL_INTERVAL_MS = 60_000; // check every 60 s
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);

  const checkSession = async () => {
    if (runningRef.current) return; // prevent overlapping checks
    runningRef.current = true;

    try {
      const session = await getSession();
      if (!session?.access_token) return; // not authenticated — middleware handles redirect

      const res = await fetch(`${BASE_URL}/auth/session/verify`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401) {
        let type: string | undefined;
        try {
          const body = await res.json();
          type = body?.type;
        } catch {
          /* non-JSON body — ignore */
        }

        if (type === "SessionInvalid") {
          toast.error(
            "Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo.",
            { id: "session-displaced", duration: 6000 },
          );
          await signOut({ redirect: false });
          window.location.href = "/login?reason=session_displaced";
        }
      }
    } catch {
      // Network error — skip silently, will retry on next poll
    } finally {
      runningRef.current = false;
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;

    const schedule = () => {
      timerRef.current = setTimeout(async () => {
        if (!document.hidden) {
          await checkSession();
        }
        schedule(); // reschedule regardless
      }, POLL_INTERVAL_MS);
    };

    schedule();

    // Pause/resume on visibility change
    const onVisibilityChange = () => {
      if (!document.hidden) {
        // Tab just became visible — check immediately
        checkSession();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return <>{children}</>;
}
