"use client";

import { useMemo, useState } from "react";
import { Bell, PlusCircle } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/tables/DataTable";
import { buildNotificationsColumns } from "@/components/tables/columns/notifications-columns";
import { NotificationViewersModal } from "@/components/shared/NotificationViewersModal";
import {
	useNotifications,
	useDeleteNotification,
} from "@/features/notifications/hooks/useNotifications";
import { usePermissions } from "@/hooks/usePermissions";

export default function NotificationsPage() {
	const { data, isLoading, isError } = useNotifications(0, 100);
	const deleteNotification = useDeleteNotification();
	const { hasPermission } = usePermissions();
	const canManage = hasPermission("notification:manage");

	const [viewingId, setViewingId] = useState<string | null>(null);

	const columns = useMemo(
		() =>
			buildNotificationsColumns(
				canManage ? (id) => deleteNotification.mutate(id) : () => {},
				canManage,
				(id) => setViewingId(id),
			),
		[deleteNotification, canManage],
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-foreground">
						Notificaciones
					</h2>
					<p className="text-sm text-muted-foreground">
						Mensajes enviados a los usuarios de la plataforma.
					</p>
				</div>
				{canManage && (
					<Link
						href="/notifications/new"
						className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
						<PlusCircle className="h-4 w-4" />
						Nueva notificación
					</Link>
				)}
			</div>

			{isLoading && (
				<p className="text-sm text-muted-foreground">
					Cargando notificaciones…
				</p>
			)}
			{isError && (
				<p className="text-sm text-destructive">
					Error al cargar notificaciones. Verifica que la API esté disponible.
				</p>
			)}

			{!isLoading && (
				<DataTable
					columns={columns}
					data={data ?? []}
					searchPlaceholder="Buscar notificaciones…"
				/>
			)}

			<NotificationViewersModal
				notificationId={viewingId}
				onClose={() => setViewingId(null)}
			/>
		</div>
	);
}
