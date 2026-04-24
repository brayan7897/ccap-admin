"use client";

import { useState, useMemo, useEffect } from "react";
import { Bell, Check, CheckCheck, Globe, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
	useMarkRead,
	useMarkAllRead,
	useMarkSeen,
	useDeleteFromInbox,
} from "@/features/notifications/hooks/useNotifications";
import { notificationsService } from "@/features/notifications/services/notifications.service";
import type { NotificationType, UserNotification } from "@/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_META: Record<
	NotificationType,
	{ label: string; badgeClass: string }
> = {
	SYSTEM: {
		label: "Sistema",
		badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
	},
	COURSE_UPDATE: {
		label: "Curso",
		badgeClass:
			"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	ACHIEVEMENT: {
		label: "Logro",
		badgeClass:
			"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	},
	PROMOTION: {
		label: "Promoción",
		badgeClass:
			"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	},
	REMINDER: {
		label: "Recordatorio",
		badgeClass:
			"bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
	},
};

function relativeTime(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const mins = Math.floor(diff / 60_000);
	if (mins < 1) return "ahora mismo";
	if (mins < 60) return `hace ${mins} min`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 24) return `hace ${hrs} h`;
	const days = Math.floor(hrs / 24);
	return `hace ${days} d`;
}

// ── Filters ───────────────────────────────────────────────────────────────────
type FilterValue = "ALL" | "UNREAD" | "READ";

const FILTERS: { value: FilterValue; label: string }[] = [
	{ value: "ALL", label: "Todas" },
	{ value: "UNREAD", label: "No leídas" },
	{ value: "READ", label: "Leídas" },
];

// ── Single notification row ───────────────────────────────────────────────────
function InboxRow({
	notif,
	onMarkRead,
	onDelete,
}: {
	notif: UserNotification;
	onMarkRead: (id: string) => void;
	onDelete: (id: string) => void;
}) {
	const meta = TYPE_META[notif.type] ?? TYPE_META.SYSTEM;

	return (
		<div
			className={`group flex items-start gap-4 rounded-lg border border-border p-4 transition-colors ${
				!notif.is_read
					? "bg-primary/5 border-primary/20"
					: "bg-card hover:bg-muted/30"
			}`}>
			{/* Unread indicator */}
			<div className="mt-1 shrink-0">
				{notif.is_read ? (
					<div className="h-2.5 w-2.5 rounded-full bg-muted" />
				) : (
					<div className="h-2.5 w-2.5 rounded-full bg-primary" />
				)}
			</div>

			{/* Body */}
			<div className="min-w-0 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-sm font-semibold text-foreground">
						{notif.title}
					</span>
					<span
						className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${meta.badgeClass}`}>
						{meta.label}
					</span>
					{notif.is_global && (
						<span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
							<Globe className="h-3 w-3" />
							Global
						</span>
					)}
					{!notif.is_global && (
						<span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
							<User className="h-3 w-3" />
							Dirigida
						</span>
					)}
				</div>

				<p className="mt-1 text-sm text-muted-foreground">{notif.message}</p>

				{notif.action_url && (
					<Link
						href={notif.action_url}
						className="mt-1 inline-block text-xs text-primary hover:underline">
						{notif.action_url}
					</Link>
				)}

				<p className="mt-2 text-xs text-muted-foreground/70">
					{relativeTime(notif.created_at)}
					{notif.is_read && notif.read_at && (
						<> · Leída {relativeTime(notif.read_at)}</>
					)}
				</p>
			</div>

			{/* Actions */}
			<div className="flex shrink-0 items-center gap-1 self-start opacity-0 transition-opacity group-hover:opacity-100">
				{!notif.is_read && (
					<button
						type="button"
						onClick={() => onMarkRead(notif.id)}
						title="Marcar como leída"
						className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
						<Check className="h-4 w-4" />
					</button>
				)}
				<button
					type="button"
					onClick={() => onDelete(notif.id)}
					title="Descartar notificación"
					className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
					<Trash2 className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NotificationsInboxPage() {
	const [filter, setFilter] = useState<FilterValue>("ALL");

	const {
		data: inbox,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["notifications", "inbox", "full"],
		queryFn: () => notificationsService.getInbox(0, 100),
		refetchInterval: 60_000,
	});

	const markRead = useMarkRead();
	const markAllRead = useMarkAllRead();
	const markSeen = useMarkSeen();
	const deleteFromInbox = useDeleteFromInbox();

	// Mark all loaded items as seen (Redis SET tracking) when they first appear
	useEffect(() => {
		if (inbox) {
			inbox.forEach((n) => markSeen.mutate(n.notification_id));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [!!inbox]);

	const filtered = useMemo(() => {
		if (!inbox) return [];
		if (filter === "UNREAD") return inbox.filter((n) => !n.is_read);
		if (filter === "READ") return inbox.filter((n) => n.is_read);
		return inbox;
	}, [inbox, filter]);

	const unreadCount = inbox?.filter((n) => !n.is_read).length ?? 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-foreground">
						Mi bandeja de entrada
					</h2>
					<p className="text-sm text-muted-foreground">
						Notificaciones recibidas en tu cuenta de administrador.
					</p>
				</div>

				{unreadCount > 0 && (
					<button
						type="button"
						onClick={() => markAllRead.mutate()}
						disabled={markAllRead.isPending}
						className="inline-flex items-center gap-2 rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50">
						<CheckCheck className="h-4 w-4" />
						Marcar todas como leídas
						<span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
							{unreadCount}
						</span>
					</button>
				)}
			</div>

			{/* Filter tabs */}
			<div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
				{FILTERS.map((f) => {
					const count =
						f.value === "ALL"
							? (inbox?.length ?? 0)
							: f.value === "UNREAD"
								? unreadCount
								: (inbox?.filter((n) => n.is_read).length ?? 0);

					return (
						<button
							key={f.value}
							type="button"
							onClick={() => setFilter(f.value)}
							className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
								filter === f.value
									? "bg-background text-foreground shadow-sm"
									: "text-muted-foreground hover:text-foreground"
							}`}>
							{f.label}
							<span
								className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
									filter === f.value
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground"
								}`}>
								{count}
							</span>
						</button>
					);
				})}
			</div>

			{/* States */}
			{isLoading && (
				<p className="text-sm text-muted-foreground">Cargando bandeja…</p>
			)}
			{isError && (
				<p className="text-sm text-destructive">
					Error al cargar las notificaciones. Verifica que la API esté
					disponible.
				</p>
			)}

			{/* List */}
			{!isLoading && filtered.length === 0 && (
				<div className="flex flex-col items-center gap-3 py-16 text-center">
					<Bell className="h-12 w-12 text-muted-foreground/30" />
					<p className="text-sm font-medium text-muted-foreground">
						{filter === "UNREAD"
							? "No tienes notificaciones sin leer."
							: "No hay notificaciones."}
					</p>
				</div>
			)}

			{!isLoading && filtered.length > 0 && (
				<div className="space-y-2">
					{filtered.map((notif) => (
						<InboxRow
							key={notif.id}
							notif={notif}
							onMarkRead={(id) => markRead.mutate(id)}
							onDelete={(id) => deleteFromInbox.mutate(id)}
						/>
					))}
				</div>
			)}
		</div>
	);
}
