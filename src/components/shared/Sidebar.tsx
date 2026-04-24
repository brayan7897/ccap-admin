"use client";

import { useUiStore } from "@/store/ui-store";
import {
	Award,
	Bell,
	BookOpen,
	ChevronLeft,
	GraduationCap,
	Inbox,
	LayoutDashboard,
	ShieldCheck,
	Tag,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";

const navGroups = [
	{
		label: "General",
		items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
	},
	{
		label: "Contenido",
		items: [
			{ label: "Cursos", href: "/courses", icon: BookOpen },
			{ label: "Categorías", href: "/categories", icon: Tag },
		],
	},
	{
		label: "Usuarios",
		items: [
			{ label: "Usuarios", href: "/users", icon: Users },
			{ label: "Roles", href: "/roles", icon: ShieldCheck },
		],
	},
	{
		label: "Actividad",
		items: [
			{ label: "Inscripciones", href: "/enrollments", icon: GraduationCap },
			{ label: "Certificados", href: "/certificates", icon: Award },
			{ label: "Notificaciones", href: "/notifications", icon: Bell },
		],
	},
];

export function Sidebar() {
	const { sidebarOpen, toggleSidebar } = useUiStore();
	const pathname = usePathname();
	const { hasPermission, hasAnyPermission } = usePermissions();

	// Define required permissions for each nav item
	const navGroups = [
		{
			label: "General",
			items: [{ label: "Dashboard", href: "/", icon: LayoutDashboard }],
		},
		{
			label: "Contenido",
			items: [
				{
					label: "Cursos",
					href: "/courses",
					icon: BookOpen,
					permissions: [
						"course:create",
						"course:edit",
						"course:publish",
						"course:delete",
					],
				},
				{
					label: "Categorías",
					href: "/categories",
					icon: Tag,
					permissions: [
						"course:create",
						"course:edit",
						"course:publish",
						"course:delete",
					],
				},
			],
		},
		{
			label: "Usuarios",
			items: [
				{
					label: "Usuarios",
					href: "/users",
					icon: Users,
					permissions: ["user:manage"],
				},
				{
					label: "Roles",
					href: "/roles",
					icon: ShieldCheck,
					permissions: ["admin:access"],
				},
			],
		},
		{
			label: "Actividad",
			items: [
				{
					label: "Matrículas",
					href: "/enrollments",
					icon: GraduationCap,
					permissions: ["enrollment:manage"],
				},
				{
					label: "Certificados",
					href: "/certificates",
					icon: Award,
					permissions: ["certificate:manage"],
				},
				{
					label: "Notificaciones",
					href: "/notifications",
					icon: Bell,
					permissions: ["notification:manage"],
					exact: true,
				},
				{ label: "Mi bandeja", href: "/notifications/inbox", icon: Inbox },
			],
		},
	];

	return (
		<aside
			className={cn(
				"relative flex h-screen flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
				sidebarOpen ? "w-60" : "w-16",
			)}>
			{/* Brand */}
			<div
				className={cn(
					"flex h-16 shrink-0 items-center border-b border-sidebar-border px-4",
					sidebarOpen ? "justify-between" : "justify-center",
				)}>
				{sidebarOpen && (
					<span className="text-base font-bold tracking-wide text-sidebar-foreground">
						CCAP Admin
					</span>
				)}
				<button
					onClick={toggleSidebar}
					aria-label="Alternar sidebar"
					className="rounded-md p-1.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
					<ChevronLeft
						className={cn(
							"h-5 w-5 transition-transform duration-300",
							!sidebarOpen && "rotate-180",
						)}
					/>
				</button>
			</div>

			{/* Navigation */}
			<nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4">
				{navGroups.map(({ label, items }) => {
					// Filter items based on permissions
					const visibleItems = items.filter((item) => {
						if (!item.permissions) return true;
						return hasAnyPermission(...item.permissions);
					});

					// If no items are visible in this group, hide the group
					if (visibleItems.length === 0) return null;

					return (
						<div key={label}>
							{sidebarOpen && (
								<p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
									{label}
								</p>
							)}
							<div className="space-y-0.5">
								{visibleItems.map(
									({ label: itemLabel, href, icon: Icon, exact }) => {
										const active =
											href === "/" || exact
												? pathname === href
												: pathname.startsWith(href);
										return (
											<Link
												key={href}
												href={href}
												title={!sidebarOpen ? itemLabel : undefined}
												className={cn(
													"flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
													active
														? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
														: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
													!sidebarOpen && "justify-center",
												)}>
												<Icon className="h-4 w-4 shrink-0" />
												{sidebarOpen && <span>{itemLabel}</span>}
											</Link>
										);
									},
								)}
							</div>
						</div>
					);
				})}
			</nav>

			{/* Footer */}
			{sidebarOpen && (
				<div className="shrink-0 border-t border-sidebar-border px-4 py-3">
					<p className="text-[10px] text-sidebar-foreground/40">
						CCAP GLOBAL S.R.L. © {new Date().getFullYear()}
					</p>
				</div>
			)}
		</aside>
	);
}
