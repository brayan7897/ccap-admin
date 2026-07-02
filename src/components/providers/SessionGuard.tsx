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
import { toast } from "sonner";
import { API_URL } from "@/lib/config";
import { api } from "@/lib/api";

const POLL_INTERVAL_MS = 60_000; // check every 60 s

export function SessionGuard({ children }: { children: React.ReactNode }) {
	const { data: session, status } = useSession();
	const sessionRef = useRef(session);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const runningRef = useRef(false);
	const isMountedRef = useRef(true);

	// Mantener la ref del session sincronizada sin desencadenar useEffect del polling
	useEffect(() => {
		sessionRef.current = session;
	}, [session]);

	useEffect(() => {
		isMountedRef.current = true;
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	const checkSession = async () => {
		if (runningRef.current) return; // prevent overlapping checks
		runningRef.current = true;

		try {
			const currentSession = sessionRef.current;
			if (!currentSession?.access_token) return; // not authenticated — middleware handles redirect

			// Using api.get instead of raw fetch. The interceptor in api.ts will inject the token.
			// We handle the specific 401 SessionInvalid case manually before the global interceptor
			// redirects us (the global interceptor handles generic 401s).
			try {
				await api.get("/auth/session/verify");
			} catch (err: any) {
				const status = err.response?.status;
				const type = err.response?.data?.type;

				if (status === 401 && type === "SessionInvalid" && isMountedRef.current) {
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
