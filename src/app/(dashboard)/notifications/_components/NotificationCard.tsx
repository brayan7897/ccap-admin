"use client";

import type { Notification, NotificationType } from "@/types";
import { Globe, User, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_BADGE: Record<NotificationType, { label: string; className: string }> = {
	SYSTEM: { label: "Sistema", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
	COURSE_UPDATE: { label: "Curso", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
	ACHIEVEMENT: { label: "Logro", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
	PROMOTION: { label: "Promoción", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
	REMINDER: { label: "Recordatorio", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
};

interface NotificationCardProps {
	notification: Notification;
	onClick: () => void;
}

export function NotificationCard({ notification, onClick }: NotificationCardProps) {
	const badge = TYPE_BADGE[notification.type] ?? TYPE_BADGE.SYSTEM;

	return (
		<div
			onClick={onClick}
			className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
		>
			<div className="p-4 flex-1">
				<div className="flex justify-between items-start gap-4 mb-2">
					<span className={cn("shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", badge.className)}>
						{badge.label}
					</span>
					
					<span className="text-[10px] text-muted-foreground flex items-center gap-1">
						<Clock className="h-3 w-3" />
						{new Date(notification.created_at).toLocaleDateString("es-PE", {
							day: "2-digit",
							month: "short",
							year: "numeric"
						})}
					</span>
				</div>

				<h3 className="font-semibold text-sm leading-tight text-foreground mb-1 line-clamp-1">
					{notification.title}
				</h3>
				<p className="text-xs text-muted-foreground line-clamp-2 mb-3">
					{notification.message}
				</p>

				<div className="mt-auto">
					{notification.is_global ? (
						<span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
							<Globe className="h-3 w-3" />
							Global
						</span>
					) : (
						<span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
							<User className="h-3 w-3" />
							Dirigida
						</span>
					)}
				</div>
			</div>
			<div className="border-t border-border bg-muted/20 px-4 py-2 text-center">
				<span className="text-xs font-medium text-primary">Ver detalles</span>
			</div>
		</div>
	);
}
