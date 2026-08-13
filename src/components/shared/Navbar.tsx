"use client";

import { useUiStore } from "@/store/ui-store";
import { signOut, useSession } from "next-auth/react";
import {
	Award,
	Bell,
	BookOpen,
	ChevronDown,
	GraduationCap,
	LayoutDashboard,
	LogOut,
	Menu,
	Moon,
	Search,
	Settings,
	ShieldCheck,
	Sun,
	Tag,
	User,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NotificationBell } from "./NotificationBell";
import { apiLogout } from "@/lib/api";
import { Logo } from "@/components/ui/Logo";

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

const NAV_SEARCH_ITEMS = [
	{ href: "/", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/courses", label: "Cursos", icon: BookOpen },
	{ href: "/categories", label: "Categorías", icon: Tag },
	{ href: "/users", label: "Usuarios", icon: Users },
	{ href: "/roles", label: "Roles y Permisos", icon: ShieldCheck },
	{ href: "/enrollments", label: "Matrículas", icon: GraduationCap },
	{ href: "/certificates", label: "Certificados", icon: Award },
	{ href: "/notifications", label: "Notificaciones", icon: Bell },
	{ href: "/profile", label: "Mi Perfil", icon: User },
	{ href: "/profile?tab=settings", label: "Configuración", icon: Settings },
];

function getTitle(pathname: string): string {
	if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
	const base = "/" + pathname.split("/")[1];
	return PAGE_TITLES[base] ?? "Admin";
}

export function Navbar() {
	const { darkMode, toggleDarkMode, toggleSidebar } = useUiStore();
	const { data: session } = useSession();
	const pathname = usePathname();
	const router = useRouter();

	const [signingOut, setSigningOut] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [menuOpen, setMenuOpen] = useState(false);

	const searchInputRef = useRef<HTMLInputElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const firstName = session?.user?.firstName ?? "";
	const lastName = session?.user?.lastName ?? "";
	const email = session?.user?.email ?? "";
	const roleName = session?.user?.roleName ?? "";
	const fullName = `${firstName} ${lastName}`.trim() || email;
	const initials =
		firstName && lastName
			? `${firstName[0]}${lastName[0]}`.toUpperCase()
			: (email[0] ?? "A").toUpperCase();

	// Ctrl+K opens search
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "k") {
				e.preventDefault();
				setSearchOpen(true);
			}
			if (e.key === "Escape") {
				setSearchOpen(false);
				setMenuOpen(false);
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	}, []);

	// Focus input when search opens
	useEffect(() => {
		if (searchOpen) {
			setTimeout(() => searchInputRef.current?.focus(), 0);
		} else {
			setSearchQuery("");
		}
	}, [searchOpen]);

	// Close dropdown on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const filteredItems = NAV_SEARCH_ITEMS.filter((item) =>
		item.label.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const handleSearchSelect = (href: string) => {
		router.push(href);
		setSearchOpen(false);
	};

	/**
	 * Graceful logout:
	 * 1. Call /auth/logout on the API → revokes the session in Redis + PostgreSQL.
	 * 2. Call NextAuth's signOut → clears the local session cookie.
	 */
	const handleSignOut = async () => {
		if (signingOut) return;
		setSigningOut(true);
		await apiLogout();
		await signOut({ callbackUrl: "/login" });
	};

	return (
		<>
			<header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 sm:px-6 shadow-sm">
				<div className="flex items-center gap-3 sm:gap-4">
					{/* Mobile Menu Toggle */}
					<button
						onClick={toggleSidebar}
						aria-label="Abrir menú"
						className="md:hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors">
						<Menu className="h-5 w-5" />
					</button>

					{/* Logo */}
					<div className="flex shrink-0 items-center">
						<Logo className="h-8 sm:h-10" variant={darkMode ? "light" : "default"} />
					</div>

					{/* Separator */}
					<div className="hidden h-6 w-px bg-border sm:block mx-1" />

					{/* Page title */}
					<h1 className="hidden text-base font-semibold text-foreground sm:block">
						{getTitle(pathname)}
					</h1>
				</div>

				<div className="flex items-center gap-1">
					{/* Search trigger */}
					<button
						onClick={() => setSearchOpen(true)}
						aria-label="Buscar sección"
						className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
						<Search className="h-4 w-4" />
						<span className="hidden sm:inline">Buscar…</span>
						<kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-background px-1 font-mono text-[10px] text-muted-foreground">
							Ctrl K
						</kbd>
					</button>

					{/* Dark mode toggle */}
					<button
						onClick={toggleDarkMode}
						aria-label="Alternar modo oscuro"
						className={`rounded-md p-2.5 transition-colors ${
							darkMode
								? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
								: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
						}`}>
						{darkMode ? (
							<Moon className="h-5 w-5" />
						) : (
							<Sun className="h-5 w-5" />
						)}
					</button>

					{/* Notification bell */}
					<NotificationBell />

					{/* Separator */}
					<div className="mx-2 h-5 w-px bg-border" />

					{/* User dropdown */}
					<div ref={menuRef} className="relative">
						<button
							onClick={() => setMenuOpen((v) => !v)}
							aria-label="Menú de usuario"
							className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted transition-colors duration-150">
							{/* Avatar initials */}
							<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
								{initials}
							</span>
							<div className="hidden flex-col items-start sm:flex">
								<span className="max-w-30 truncate font-medium leading-tight">
									{fullName}
								</span>
								<span className="text-[11px] leading-tight text-muted-foreground">
									{roleName}
								</span>
							</div>
							<ChevronDown
								className={`h-4 w-4 text-muted-foreground transition-transform duration-150 ${menuOpen ? "rotate-180" : ""}`}
							/>
						</button>

						{menuOpen && (
							<div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-border bg-card shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
								{/* Admin info */}
								<div className="border-b border-border px-4 py-3 bg-muted/20">
									<p className="truncate text-sm font-semibold text-foreground">
										{fullName}
									</p>
									<p className="truncate text-xs text-muted-foreground">
										{email}
									</p>
									<span className="mt-1.5 inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
										{roleName}
									</span>
								</div>

								{/* Navigation links */}
								<div className="p-1.5">
									<Link
										href="/profile"
										onClick={() => setMenuOpen(false)}
										className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
										<User className="h-4 w-4 text-muted-foreground" />
										Mi perfil
									</Link>
									<Link
										href="/profile?tab=settings"
										onClick={() => setMenuOpen(false)}
										className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
										<Settings className="h-4 w-4 text-muted-foreground" />
										Configuración
									</Link>
								</div>

								{/* Sign out */}
								<div className="border-t border-border p-1.5">
									<button
										onClick={handleSignOut}
										disabled={signingOut}
										className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:pointer-events-none disabled:opacity-50">
										<LogOut className="h-4 w-4" />
										{signingOut ? "Saliendo…" : "Cerrar sesión"}
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</header>

			{/* Search modal */}
			{searchOpen && (
				<div
					className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[18vh]"
					onClick={(e) => {
						if (e.target === e.currentTarget) setSearchOpen(false);
					}}>
					<div className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl">
						<div className="flex items-center gap-3 border-b border-border px-4 py-3">
							<Search className="h-4 w-4 shrink-0 text-muted-foreground" />
							<input
								ref={searchInputRef}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Buscar sección…"
								className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
							/>
							<kbd className="rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
								ESC
							</kbd>
						</div>
						<ul className="max-h-64 overflow-y-auto p-1.5">
							{filteredItems.length === 0 ? (
								<li className="px-3 py-6 text-center text-sm text-muted-foreground">
									Sin resultados
								</li>
							) : (
								filteredItems.map(({ href, label, icon: Icon }) => (
									<li key={href}>
										<button
											onClick={() => handleSearchSelect(href)}
											className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
											<Icon className="h-4 w-4 text-muted-foreground" />
											{label}
										</button>
									</li>
								))
							)}
						</ul>
					</div>
				</div>
			)}
		</>
	);
}
