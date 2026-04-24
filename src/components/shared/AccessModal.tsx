"use client";

import { X } from "lucide-react";
import type { CourseAccess, User } from "@/types";

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

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={onClose}>
			<div
				className="w-full max-w-sm rounded-xl bg-background p-6 shadow-xl"
				onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="flex items-center justify-between mb-5">
					<h2 className="text-lg font-semibold text-foreground">
						Acceso a cursos
					</h2>
					<button
						onClick={onClose}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors">
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* User info */}
				<div className="mb-5 space-y-0.5">
					<p className="text-sm font-medium text-foreground">
						{user.full_name || `${user.first_name} ${user.last_name}`}
					</p>
					<p className="text-sm text-muted-foreground">{user.email}</p>
				</div>

				{/* Current status */}
				<div className="mb-6 flex items-center gap-2">
					<span className="text-sm text-muted-foreground">Estado actual:</span>
					<span
						className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}>
						{badge.label}
					</span>
				</div>

				{/* Actions */}
				<div className="flex gap-3">
					<button
						onClick={() => {
							onUpdateAccess(user.id, "APPROVED");
							onClose();
						}}
						disabled={isApproved || isLoading}
						className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
						Aprobar
					</button>
					<button
						onClick={() => {
							onUpdateAccess(user.id, "REJECTED");
							onClose();
						}}
						disabled={isRejected || isLoading}
						className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed">
						Rechazar
					</button>
				</div>
			</div>
		</div>
	);
}
