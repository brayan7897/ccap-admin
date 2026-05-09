"use client";

import type { Notification, NotificationType } from "@/types";
import { X, Globe, User, Clock, Eye, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationDetailModalProps {
	notification: Notification | null;
	isOpen: boolean;
	onClose: () => void;
	onDelete: (id: string) => void;
	onStats?: (id: string) => void;
	canManage: boolean;
}

const TYPE_BADGE: Record<NotificationType, { label: string; className: string }> = {
	SYSTEM: { label: "Sistema", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
	COURSE_UPDATE: { label: "Curso", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
	ACHIEVEMENT: { label: "Logro", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
	PROMOTION: { label: "Promoción", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
	REMINDER: { label: "Recordatorio", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

export function NotificationDetailModal({
	notification,
	isOpen,
	onClose,
	onDelete,
	onStats,
	canManage,
}: NotificationDetailModalProps) {
	if (!isOpen || !notification) return null;

	const badge = TYPE_BADGE[notification.type] ?? TYPE_BADGE.SYSTEM;

	return (
		<div
			className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30 shrink-0">
					<div className="flex-1 mr-4">
						<span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider mb-2", badge.className)}>
							{badge.label}
						</span>
						<h2 className="text-lg font-semibold text-foreground leading-tight">
							{notification.title}
						</h2>
					</div>
					<button
						onClick={onClose}
						className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 self-start"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5 overflow-y-auto space-y-6">
					
					{/* Message */}
					<div className="rounded-lg border border-border bg-card p-4">
						<p className="text-sm text-foreground whitespace-pre-wrap">{notification.message}</p>
					</div>

					{/* Metadata Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div className="flex items-start gap-3">
							<Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
							<div>
								<p className="text-xs text-muted-foreground">Enviado el</p>
								<p className="text-sm font-medium">
									{new Date(notification.created_at).toLocaleDateString("es-PE", {
										day: "2-digit",
										month: "long",
										year: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
							</div>
						</div>
						
						<div className="flex items-start gap-3">
							{notification.is_global ? (
								<Globe className="h-5 w-5 text-indigo-500 mt-0.5" />
							) : (
								<User className="h-5 w-5 text-muted-foreground mt-0.5" />
							)}
							<div>
								<p className="text-xs text-muted-foreground">Alcance</p>
								<p className="text-sm font-medium">
									{notification.is_global ? "Audiencia Global" : "Dirigida a usuarios específicos"}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Footer Actions */}
				<div className="border-t border-border bg-muted/30 px-6 py-4 shrink-0 flex flex-wrap gap-2 justify-end">
					{onStats && (
						<button
							onClick={() => {
								onClose();
								onStats(notification.id);
							}}
							className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
						>
							<Eye className="h-4 w-4" />
							Ver Estadísticas
						</button>
					)}
					
					{canManage && (
						<button
							onClick={() => {
								if (window.confirm("¿Seguro que deseas eliminar esta notificación de forma permanente?")) {
									onClose();
									onDelete(notification.id);
								}
							}}
							className="inline-flex items-center gap-2 rounded-md border border-destructive bg-transparent px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors ml-auto sm:ml-0"
						>
							<Trash2 className="h-4 w-4" />
							Eliminar
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
