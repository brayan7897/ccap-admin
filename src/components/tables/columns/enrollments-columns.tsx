"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Enrollment } from "@/types";
import { XCircle } from "lucide-react";
import { courseName, formatDate, studentName } from "@/lib/display";
import { EnrollmentStatusBadge } from "@/components/shared/EnrollmentStatusBadge";

// Names/emails come resolved from the API (user_full_name, course_title), so
// the table never depends on a paginated client-side catalog and never shows
// raw ids. Sorting is disabled: the server orders by enrollment date, and a
// per-page client sort would only reorder the rows currently on screen.
export function buildEnrollmentsColumns(
	onCancel: (id: string) => void,
	canManage = false,
): ColumnDef<Enrollment, unknown>[] {
	const columns: ColumnDef<Enrollment, unknown>[] = [
		{
			id: "student",
			header: "Estudiante",
			enableSorting: false,
			cell: ({ row }) => {
				const name = studentName(row.original);
				return (
					<div className="min-w-0">
						<span className="line-clamp-2 font-medium text-foreground" title={name}>
							{name}
						</span>
						{row.original.user_email && (
							<span
								className="block truncate text-xs text-muted-foreground"
								title={row.original.user_email}>
								{row.original.user_email}
							</span>
						)}
					</div>
				);
			},
		},
		{
			id: "course",
			header: "Curso",
			enableSorting: false,
			cell: ({ row }) => {
				const title = courseName(row.original);
				return (
					<span className="line-clamp-2 text-foreground/90" title={title}>
						{title}
					</span>
				);
			},
		},
		{
			accessorKey: "course_type",
			header: "Tipo",
			enableSorting: false,
			cell: ({ row }) => {
				const type = row.original.course_type;
				if (!type) return <span className="text-xs text-muted-foreground">—</span>;
				return (
					<span
						className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
							type === "PAID"
								? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
								: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
						}`}>
						{type === "PAID" ? "Pago" : "Gratis"}
					</span>
				);
			},
			meta: { className: "hidden lg:table-cell" },
		},
		{
			accessorKey: "status",
			header: "Estado",
			enableSorting: false,
			cell: ({ row }) => <EnrollmentStatusBadge status={row.original.status} />,
		},
		{
			accessorKey: "progress_percentage",
			header: "Progreso",
			enableSorting: false,
			cell: ({ row }) => {
				const pct = Math.min(100, Math.max(0, row.original.progress_percentage ?? 0));
				return (
					<div className="flex min-w-24 items-center gap-2">
						<div
							role="progressbar"
							aria-label="Progreso del estudiante"
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={Math.round(pct)}
							className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
							<div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
						</div>
						<span className="text-xs tabular-nums text-muted-foreground">{pct.toFixed(0)}%</span>
					</div>
				);
			},
			meta: { className: "hidden lg:table-cell" },
		},
		{
			accessorKey: "enrolled_at",
			header: "Matriculado el",
			enableSorting: false,
			cell: ({ row }) => (
				<span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
					{formatDate(row.original.enrolled_at, {
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
					})}
				</span>
			),
			meta: { className: "hidden xl:table-cell" },
		},
	];

	if (canManage) {
		columns.push({
			id: "actions",
			header: () => <span className="sr-only">Acciones</span>,
			enableSorting: false,
			cell: ({ row }) => {
				const isCancelled = row.original.status === "CANCELLED";
				const name = studentName(row.original);
				return (
					<div className="flex justify-end">
						<button
							type="button"
							onClick={() => {
								if (
									window.confirm(
										"¿Seguro que deseas cancelar esta matrícula? Retirará el acceso del usuario al curso.",
									)
								) {
									onCancel(row.original.id);
								}
							}}
							disabled={isCancelled}
							aria-label={
								isCancelled
									? `Matrícula de ${name} ya cancelada`
									: `Cancelar matrícula de ${name}`
							}
							title={isCancelled ? "Ya cancelada" : "Cancelar matrícula"}
							className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
								isCancelled
									? "cursor-not-allowed text-muted-foreground/40"
									: "cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
							}`}>
							<XCircle className="h-4 w-4" />
						</button>
					</div>
				);
			},
		});
	}

	return columns;
}
