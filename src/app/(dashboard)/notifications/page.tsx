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
import type { Notification, NotificationType } from "@/types";
import { NotificationFilters } from "./_components/NotificationFilters";
import { NotificationCard } from "./_components/NotificationCard";
import { NotificationDetailModal } from "./_components/NotificationDetailModal";

export default function NotificationsPage() {
	const { data, isLoading, isError } = useNotifications(0, 100);
	const deleteNotification = useDeleteNotification();
	const { hasPermission } = usePermissions();
	const canManage = hasPermission("notification:manage");

	const [viewingId, setViewingId] = useState<string | null>(null);
	const [selectedViewNotification, setSelectedViewNotification] = useState<Notification | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [typeFilter, setTypeFilter] = useState<NotificationType | "ALL">("ALL");

	const filteredData = useMemo(() => {
		if (!data) return [];
		return data.filter((n) => {
			const matchesType = typeFilter === "ALL" || n.type === typeFilter;
			const search = searchQuery.toLowerCase();
			const matchesSearch = !search || n.title.toLowerCase().includes(search) || n.message.toLowerCase().includes(search);
			return matchesType && matchesSearch;
		});
	}, [data, typeFilter, searchQuery]);

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

			{!isLoading && !isError && (
				<>
					<NotificationFilters
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						typeFilter={typeFilter}
						onTypeChange={setTypeFilter}
					/>

					<div className="hidden md:block">
						<DataTable
							columns={columns}
							data={filteredData}
							searchPlaceholder="Buscar notificaciones…"
							hideSearch
							onRowClick={setSelectedViewNotification}
						/>
					</div>

					<div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
						{filteredData.length > 0 ? (
							filteredData.map((notification) => (
								<NotificationCard
									key={notification.id}
									notification={notification}
									onClick={() => setSelectedViewNotification(notification)}
								/>
							))
						) : (
							<div className="col-span-full py-8 text-center text-sm text-muted-foreground bg-card border border-border rounded-xl">
								No se encontraron notificaciones que coincidan con los filtros.
							</div>
						)}
					</div>
				</>
			)}

			<NotificationViewersModal
				notificationId={viewingId}
				onClose={() => setViewingId(null)}
			/>

			<NotificationDetailModal
				notification={selectedViewNotification}
				isOpen={!!selectedViewNotification}
				onClose={() => setSelectedViewNotification(null)}
				onDelete={(id) => deleteNotification.mutate(id)}
				onStats={(id) => setViewingId(id)}
				canManage={canManage}
			/>
		</div>
	);
}
