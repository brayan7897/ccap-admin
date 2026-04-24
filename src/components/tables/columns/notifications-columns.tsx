"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Notification, NotificationType } from "@/types";
import { Eye, Globe, Trash2, User } from "lucide-react";

const TYPE_BADGE: Record<
	NotificationType,
	{ label: string; className: string }
> = {
	SYSTEM: {
		label: "Sistema",
		className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
	},
	COURSE_UPDATE: {
		label: "Curso",
		className:
			"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	ACHIEVEMENT: {
		label: "Logro",
		className:
			"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	},
	PROMOTION: {
		label: "Promoción",
		className:
			"bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
	},
	REMINDER: {
		label: "Recordatorio",
		className:
			"bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
	},
};

export function buildNotificationsColumns(
	onDelete: (id: string) => void,
	canDelete = false,
	onStats?: (id: string) => void,
): ColumnDef<Notification, unknown>[] {
	const cols: ColumnDef<Notification, unknown>[] = [
		{
			accessorKey: "type",
			header: "Tipo",
			cell: ({ row }) => {
				const badge = TYPE_BADGE[row.original.type] ?? TYPE_BADGE.SYSTEM;
				return (
					<span
						className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
						{badge.label}
					</span>
				);
			},
		},
		{
			accessorKey: "title",
			header: "Título",
			cell: ({ row }) => (
				<span className="font-medium text-foreground">
					{row.original.title}
				</span>
			),
		},
		{
			accessorKey: "message",
			header: "Mensaje",
			cell: ({ row }) => {
				const msg = row.original.message;
				return (
					<span className="text-muted-foreground" title={msg}>
						{msg.length > 60 ? `${msg.slice(0, 60)}…` : msg}
					</span>
				);
			},
		},
		{
			accessorKey: "is_global",
			header: "Alcance",
			cell: ({ row }) =>
				row.original.is_global ? (
					<span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
						<Globe className="h-3 w-3" />
						Global
					</span>
				) : (
					<span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
						<User className="h-3 w-3" />
						Dirigida
					</span>
				),
		},
		{
			accessorKey: "created_at",
			header: "Enviado",
			enableSorting: true,
			cell: ({ row }) =>
				new Date(row.original.created_at).toLocaleDateString("es-PE", {
					day: "2-digit",
					month: "short",
					year: "numeric",
				}),
		},
		{
			id: "actions",
			header: "Acciones",
			cell: ({ row }) => (
				<div className="flex items-center gap-1">
					{onStats && (
						<button
							onClick={() => onStats(row.original.id)}
							className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
							title="Ver estadísticas de visualización">
							<Eye className="h-4 w-4" />
						</button>
					)}
					{canDelete ? (
						<button
							onClick={() => onDelete(row.original.id)}
							className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
							title="Eliminar (hard-delete)">
							<Trash2 className="h-4 w-4" />
						</button>
					) : (
						!onStats && <span className="text-xs text-muted-foreground">—</span>
					)}
				</div>
			),
		},
	];

	return cols;
}
