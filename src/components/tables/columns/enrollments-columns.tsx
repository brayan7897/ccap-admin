"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Enrollment, EnrollmentStatus } from "@/types";
import { XCircle } from "lucide-react";

const STATUS_BADGE: Record<
	EnrollmentStatus,
	{ label: string; className: string }
> = {
	ENROLLED: {
		label: "Matriculado",
		className:
			"bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	ACTIVE: {
		label: "Activo",
		className:
			"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	},
	COMPLETED: {
		label: "Completado",
		className:
			"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	},
	CANCELLED: {
		label: "Cancelado",
		className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	},
};

export function buildEnrollmentsColumns(
	onCancel: (id: string) => void,
	userMap: Record<string, string> = {},
	courseMap: Record<string, string> = {},
	canManage = false,
): ColumnDef<Enrollment, unknown>[] {
	const columns: ColumnDef<Enrollment, unknown>[] = [
		{
			accessorKey: "course_title",
			header: "Curso",
			cell: ({ row }) =>
				row.original.course_title ??
				courseMap[row.original.course_id] ??
				row.original.course_id,
		},
		{
			accessorKey: "user_full_name",
			header: "Estudiante",
			cell: ({ row }) =>
				row.original.user_full_name ??
				userMap[row.original.user_id] ??
				row.original.user_id,
		},
		{
			accessorKey: "course_type",
			header: "Tipo",
			cell: ({ row }) => {
				const type = row.original.course_type;
				if (!type)
					return <span className="text-muted-foreground text-xs">—</span>;
				return (
					<span
						className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
							type === "PAID"
								? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
								: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
						}`}>
						{type === "PAID" ? "Pago" : "Gratis"}
					</span>
				);
			},
		},
		{
			accessorKey: "status",
			header: "Estado",
			cell: ({ row }) => {
				const status = (row.original.status ?? "ENROLLED") as EnrollmentStatus;
				const badge = STATUS_BADGE[status] ?? STATUS_BADGE.ENROLLED;
				return (
					<span
						className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
						{badge.label}
					</span>
				);
			},
		},
		{
			accessorKey: "progress_percentage",
			header: "Progreso",
			cell: ({ row }) => {
				const pct = row.original.progress_percentage ?? 0;
				return (
					<div className="flex items-center gap-2 min-w-20">
						<div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
							<div
								className="h-full rounded-full bg-primary transition-all"
								style={{ width: `${pct}%` }}
							/>
						</div>
						<span className="text-xs text-muted-foreground">
							{pct.toFixed(0)}%
						</span>
					</div>
				);
			},
		},
		{
			accessorKey: "enrolled_at",
			header: "Matriculado el",
			cell: ({ row }) => {
				const date = row.original.enrolled_at;
				if (!date)
					return <span className="text-muted-foreground text-xs">—</span>;
				return (
					<span className="text-xs text-muted-foreground">
						{new Date(date).toLocaleDateString("es-PE", {
							day: "2-digit",
							month: "short",
							year: "numeric",
						})}
					</span>
				);
			},
		},
	];

	if (canManage) {
		columns.push({
			id: "actions",
			header: "Acciones",
			cell: ({ row }) => {
				const isCancelled = row.original.status === "CANCELLED";
				return (
					<button
						onClick={() => onCancel(row.original.id)}
						disabled={isCancelled}
						className={`rounded-md p-1.5 transition-colors ${
							isCancelled
								? "cursor-not-allowed text-muted-foreground/40"
								: "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
						}`}
						title={isCancelled ? "Ya cancelada" : "Cancelar matrícula"}>
						<XCircle className="h-4 w-4" />
					</button>
				);
			},
		});
	}

	return columns;
}
