"use client";

import type { CourseAccess, User } from "@/types";
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";

const AUTH_PROVIDER_LABEL: Record<NonNullable<User["auth_provider"]>, string> = {
	google: "Google",
	local: "Manual (email/contraseña)",
	pending: "Sin acceso aún",
};

const ACCESS_BADGE: Record<CourseAccess, { label: string; className: string }> = {
	NONE: {
		label: "Sin acceso",
		className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
	},
	PENDING: {
		label: "Pendiente",
		className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	},
	APPROVED: {
		label: "Aprobado",
		className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	},
	REJECTED: {
		label: "Rechazado",
		className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	},
};

interface UserCardProps {
	user: User;
	onClick: () => void;
	onManageAccess: (user: User) => void;
}

export function UserCard({ user, onClick, onManageAccess }: UserCardProps) {
	const access = (user.course_access ?? "NONE").toUpperCase() as CourseAccess;
	const badge = ACCESS_BADGE[access] ?? ACCESS_BADGE.NONE;
	const Icon =
		access === "APPROVED"
			? ShieldCheck
			: access === "REJECTED"
				? ShieldX
				: access === "PENDING"
					? ShieldAlert
					: Shield;

	return (
		<div
			onClick={onClick}
			className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
		>
			<div className="p-4 flex-1">
				<div className="flex justify-between items-start gap-4 mb-2">
					<div>
						<h3 className="font-semibold text-base leading-tight text-foreground line-clamp-1">
							{user.full_name || `${user.first_name} ${user.last_name}`}
						</h3>
						<p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
							{user.email}
						</p>
					</div>
					
					{/* Status badges */}
					<div className="flex shrink-0 flex-col items-end gap-1">
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
								user.is_active
									? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
									: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
							)}
						>
							{user.is_active ? "Activo" : "Inactivo"}
						</span>
						{user.is_claimed === false && (
							<span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
								Cuenta provisional
							</span>
						)}
					</div>
				</div>

				<div className="flex flex-col gap-2 mt-3 text-xs text-muted-foreground">
					<p className="flex items-center gap-1.5">
						<span className="font-medium text-foreground">Documento:</span>
						{user.document_type} · {user.document_number}
					</p>
					<p className="flex items-center gap-1.5">
						<span className="font-medium text-foreground">Rol:</span>
						{user.role?.name ?? user.role_name ?? "—"}
					</p>
					{user.auth_provider && (
						<p className="flex items-center gap-1.5">
							<span className="font-medium text-foreground">Método:</span>
							{AUTH_PROVIDER_LABEL[user.auth_provider]}
						</p>
					)}

					<div className="flex items-center gap-2 mt-1">
						<span className="font-medium text-foreground">Acceso:</span>
						<button 
							onClick={(e) => {
								e.stopPropagation();
								e.preventDefault();
								onManageAccess(user);
							}}
							className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold hover:opacity-80 transition-opacity", badge.className)}>
							<Icon className="h-3 w-3" />
							{badge.label}
						</button>
					</div>
				</div>
			</div>
			
			<div className="border-t border-border bg-muted/20 px-4 py-2 text-center">
				<span className="text-xs font-medium text-primary">Ver detalles</span>
			</div>
		</div>
	);
}
