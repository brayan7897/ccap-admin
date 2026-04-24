"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, Globe, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	useInbox,
	useMarkAllRead,
	useMarkRead,
	useMarkSeen,
	useDeleteFromInbox,
	useUnreadCount,
} from "@/features/notifications/hooks/useNotifications";
import type { NotificationType, UserNotification } from "@/types";

// ── Type icon / colour ────────────────────────────────────────────────────────
const TYPE_META: Record<NotificationType, { label: string; dot: string }> = {
	SYSTEM: {
		label: "Sistema",
		dot: "bg-gray-400",
	},
	COURSE_UPDATE: {
		label: "Curso",
		dot: "bg-blue-500",
	},
	ACHIEVEMENT: {
		label: "Logro",
		dot: "bg-yellow-500",
	},
	PROMOTION: {
		label: "Promoción",
		dot: "bg-purple-500",
	},
	REMINDER: {
		label: "Recordatorio",
		dot: "bg-orange-400",
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

// ── Single notification row ───────────────────────────────────────────────────
function NotifItem({
	notif,
	onMarkRead,
	onDelete,
	onClose,
}: {
	notif: UserNotification;
	onMarkRead: (id: string) => void;
	onDelete: (id: string) => void;
	onClose: () => void;
}) {
	const router = useRouter();
	const meta = TYPE_META[notif.type] ?? TYPE_META.SYSTEM;

	function handleClick() {
		if (!notif.is_read) onMarkRead(notif.id);
		if (notif.action_url) {
			router.push(notif.action_url);
			onClose();
		}
	}

	return (
		<div
			className={`group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50 ${
				!notif.is_read ? "bg-primary/5" : ""
			}`}>
			{/* Unread dot */}
			<div className="mt-1.5 flex shrink-0 flex-col items-center gap-1">
				<span
					className={`h-2 w-2 rounded-full ${!notif.is_read ? meta.dot : "bg-transparent"}`}
				/>
			</div>

			{/* Content — clickable area */}
			<button
				type="button"
				onClick={handleClick}
				className="min-w-0 flex-1 text-left">
				<div className="flex items-center gap-1.5">
					{notif.is_global && (
						<Globe className="h-3 w-3 shrink-0 text-muted-foreground" />
					)}
					<span className="truncate text-sm font-medium text-foreground">
						{notif.title}
					</span>
				</div>
				<p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
					{notif.message}
				</p>
				<span className="mt-1 block text-xs text-muted-foreground/70">
					{relativeTime(notif.created_at)}
				</span>
			</button>

			{/* Action buttons — visible on row hover */}
			<div className="flex shrink-0 flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
				{!notif.is_read && (
					<button
						type="button"
						onClick={() => onMarkRead(notif.id)}
						title="Marcar como leída"
						className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
						<Check className="h-3 w-3" />
					</button>
				)}
				<button
					type="button"
					onClick={() => onDelete(notif.id)}
					title="Descartar"
					className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
					<Trash2 className="h-3 w-3" />
				</button>
			</div>
		</div>
	);
}

// ── Main component ────────────────────────────────────────────────────────────
export function NotificationBell() {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	const { data: unreadData } = useUnreadCount();
	const { data: inbox, isLoading } = useInbox(8);
	const markRead = useMarkRead();
	const markAllRead = useMarkAllRead();
	const markSeen = useMarkSeen();
	const deleteFromInbox = useDeleteFromInbox();

	const unreadCount = unreadData?.unread_count ?? 0;

	// When panel opens, mark all visible items as seen in Redis (non-blocking)
	useEffect(() => {
		if (open && inbox) {
			inbox.forEach((n) => {
				markSeen.mutate(n.notification_id);
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

	// Close on outside click
	useEffect(() => {
		function handler(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		if (open) document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [open]);

	// Close on Escape
	useEffect(() => {
		function handler(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		if (open) document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [open]);

	return (
		<div ref={ref} className="relative">
			{/* Bell button */}
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-label="Notificaciones"
				className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
				<Bell className="h-4 w-4" />
				{unreadCount > 0 && (
					<span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-destructive-foreground">
						{unreadCount > 99 ? "99+" : unreadCount}
					</span>
				)}
			</button>

			{/* Dropdown panel */}
			{open && (
				<div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-background shadow-xl sm:w-96">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-border px-4 py-3">
						<div className="flex items-center gap-2">
							<Bell className="h-4 w-4 text-foreground" />
							<span className="text-sm font-semibold text-foreground">
								Notificaciones
							</span>
							{unreadCount > 0 && (
								<span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
									{unreadCount}
								</span>
							)}
						</div>
						<div className="flex items-center gap-1">
							{unreadCount > 0 && (
								<button
									type="button"
									onClick={() => markAllRead.mutate()}
									title="Marcar todas como leídas"
									className="rounded p-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
									<CheckCheck className="h-4 w-4" />
								</button>
							)}
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
								<X className="h-4 w-4" />
							</button>
						</div>
					</div>

					{/* List */}
					<div className="max-h-100 overflow-y-auto divide-y divide-border">
						{isLoading && (
							<p className="px-4 py-6 text-center text-sm text-muted-foreground">
								Cargando…
							</p>
						)}

						{!isLoading && (!inbox || inbox.length === 0) && (
							<div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
								<Bell className="h-8 w-8 text-muted-foreground/40" />
								<p className="text-sm text-muted-foreground">
									Sin notificaciones nuevas
								</p>
							</div>
						)}

						{inbox?.map((notif) => (
							<NotifItem
								key={notif.id}
								notif={notif}
								onMarkRead={(id) => markRead.mutate(id)}
								onDelete={(id) => deleteFromInbox.mutate(id)}
								onClose={() => setOpen(false)}
							/>
						))}
					</div>

					{/* Footer */}
					<div className="border-t border-border px-4 py-3">
						<Link
							href="/notifications/inbox"
							onClick={() => setOpen(false)}
							className="block w-full rounded-md bg-primary/10 py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/20">
							Ver todas las notificaciones
						</Link>
					</div>
				</div>
			)}
		</div>
	);
}
