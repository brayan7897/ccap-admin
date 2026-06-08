"use client";

import { X, Shield, Check, Ban } from "lucide-react";
import type { CourseAccess, User } from "@/types";
import { Portal } from "./Portal";

const ACCESS_BADGE: Record<CourseAccess, { label: string; className: string }> =
	{
		NONE: {
			label: "Sin acceso",
			className:
				"bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
		},
		PENDING: {
			label: "Pendiente",
			className:
				"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
		},
		APPROVED: {
			label: "Aprobado",
			className:
				"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
		REJECTED: {
			label: "Rechazado",
			className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		},
	};

interface AccessModalProps {
	user: User | null;
	isOpen: boolean;
	onClose: () => void;
	onUpdateAccess: (userId: string, status: "APPROVED" | "REJECTED") => void;
	isLoading?: boolean;
}

export function AccessModal({
	user,
	isOpen,
	onClose,
	onUpdateAccess,
	isLoading,
}: AccessModalProps) {
	if (!isOpen || !user) return null;

	const access = (
		(user.course_access ?? "NONE") as string
	).toUpperCase() as CourseAccess;
	const badge = ACCESS_BADGE[access] ?? ACCESS_BADGE.NONE;
	const isApproved = access === "APPROVED";
	const isRejected = access === "REJECTED";

	// Initials for avatar fallback
	const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`
		.toUpperCase()
		.trim() || "U";

	return (
		<Portal>
			<div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
				onClick={onClose}>
			<div
				className="w-full max-w-sm rounded-2xl border border-border bg-background shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
				onClick={(e) => e.stopPropagation()}>
				
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-4">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
							<Shield className="h-4 w-4" />
						</div>
						<h2 className="text-base font-semibold text-foreground">
							Acceso a cursos
						</h2>
					</div>
					<button
						onClick={onClose}
						className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="p-6">
					{/* User info */}
					<div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
						{user.avatar_url ? (
							<img
								src={user.avatar_url}
								alt={user.full_name || "Avatar"}
								className="h-10 w-10 rounded-full object-cover ring-2 ring-background"
							/>
						) : (
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-2 ring-background">
								{initials}
							</div>
						)}
						<div className="flex flex-col overflow-hidden">
							<p className="truncate text-sm font-semibold text-foreground">
								{user.full_name || `${user.first_name} ${user.last_name}`}
							</p>
							<p className="truncate text-xs text-muted-foreground">
								{user.email}
							</p>
						</div>
					</div>

					{/* Current status */}
					<div className="mb-6 rounded-lg bg-muted/40 p-4 flex flex-col items-center justify-center text-center">
						<p className="text-xs font-medium text-muted-foreground mb-2">
							Estado actual de acceso
						</p>
						<span
							className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${badge.className}`}>
							{badge.label}
						</span>
					</div>

					{/* Actions */}
					<div className="flex gap-3">
						<button
							onClick={() => {
								onUpdateAccess(user.id, "REJECTED");
								onClose();
							}}
							disabled={isRejected || isLoading}
							className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-700 transition-all hover:bg-red-100 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 disabled:pointer-events-none disabled:opacity-50">
							<Ban className="h-4 w-4" />
							Rechazar
						</button>
						<button
							onClick={() => {
								onUpdateAccess(user.id, "APPROVED");
								onClose();
							}}
							disabled={isApproved || isLoading}
							className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow disabled:pointer-events-none disabled:opacity-50">
							<Check className="h-4 w-4" />
							Aprobar
						</button>
					</div>
				</div>
				</div>
			</div>
		</Portal>
	);
}
