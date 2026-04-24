"use client";

import { useUiStore } from "@/store/ui-store";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Moon, Sun, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NotificationBell } from "./NotificationBell";
import { apiLogout } from "@/lib/api";

const PAGE_TITLES: Record<string, string> = {
	"/": "Dashboard",
	"/courses": "Cursos",
	"/categories": "Categorías",
	"/users": "Usuarios",
	"/roles": "Roles",
	"/enrollments": "Matrículas",
	"/certificates": "Certificados",
	"/notifications": "Notificaciones",
	"/notifications/inbox": "Mi bandeja",
	"/profile": "Mi Perfil",
};

function getTitle(pathname: string): string {
	if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
	const base = "/" + pathname.split("/")[1];
	return PAGE_TITLES[base] ?? "Admin";
}

export function Navbar() {
	const { darkMode, toggleDarkMode } = useUiStore();
	const { data: session } = useSession();
	const pathname = usePathname();
	const [signingOut, setSigningOut] = useState(false);

	const fullName = session?.user
		? `${session.user.firstName ?? ""} ${session.user.lastName ?? ""}`.trim() ||
			session.user.email
		: "";

	/**
	 * Graceful logout:
	 * 1. Call /auth/logout on the API → revokes the session in Redis + PostgreSQL.
	 * 2. Call NextAuth's signOut → clears the local session cookie.
	 */
	const handleSignOut = async () => {
		if (signingOut) return;
		setSigningOut(true);
		await apiLogout(); // notify backend first (non-blocking on error)
		await signOut({ callbackUrl: "/login" });
	};

	return (
		<header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
			{/* Page title */}
			<h1 className="text-base font-semibold text-foreground">
				{getTitle(pathname)}
			</h1>

			<div className="flex items-center gap-1">
				{/* Dark mode toggle */}
				<button
					onClick={toggleDarkMode}
					aria-label="Alternar modo oscuro"
					className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
					{darkMode ? (
						<Sun className="h-4 w-4" />
					) : (
						<Moon className="h-4 w-4" />
					)}
				</button>

				{/* Notification bell */}
				<NotificationBell />

				{/* Separator */}
				<div className="mx-2 h-5 w-px bg-border" />

				{/* User info - links to profile */}
				<Link
					href="/profile"
					className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-foreground hover:bg-muted transition-colors">
					<UserCircle className="h-5 w-5 text-primary" />
					<span className="hidden font-medium sm:inline">{fullName}</span>
				</Link>

				{/* Sign out */}
				<button
					onClick={handleSignOut}
					disabled={signingOut}
					aria-label="Cerrar sesión"
					className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:pointer-events-none disabled:opacity-50">
					<LogOut className="h-4 w-4" />
					<span className="hidden sm:inline">
						{signingOut ? "Saliendo…" : "Salir"}
					</span>
				</button>
			</div>
		</header>
	);
}
