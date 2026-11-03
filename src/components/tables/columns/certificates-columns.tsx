"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Certificate } from "@/types";
import { Trash2, Edit } from "lucide-react";
import { courseName, formatDate, studentName } from "@/lib/display";

// The API sends user_full_name / course_title already resolved, so the table
// never depends on a (paginated, possibly incomplete) client-side catalog.
// Sorting is disabled: the server orders by issue date and a per-page client
// sort would only reorder the 25 rows on screen, which is misleading.
export function buildCertificatesColumns(
	onEdit: (cert: Certificate) => void,
	onDelete: (id: string) => void,
): ColumnDef<Certificate, unknown>[] {
	return [
		{
			id: "student",
			header: "Estudiante",
			enableSorting: false,
			cell: ({ row }) => {
				const name = studentName(row.original);
				return (
					<span className="line-clamp-2 font-medium text-foreground" title={name}>
						{name}
					</span>
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
			accessorKey: "certificate_code",
			header: "Código",
			enableSorting: false,
			cell: ({ row }) => (
				<span className="break-all font-mono text-xs text-muted-foreground">
					{row.original.certificate_code}
				</span>
			),
			meta: { className: "hidden lg:table-cell max-w-72" },
		},
		{
			accessorKey: "issued_at",
			header: "Emitido",
			enableSorting: false,
			cell: ({ row }) => (
				<span className="whitespace-nowrap tabular-nums text-muted-foreground">
					{formatDate(row.original.issued_at, {
						day: "2-digit",
						month: "2-digit",
						year: "numeric",
					})}
				</span>
			),
			meta: { className: "hidden xl:table-cell" },
		},
		{
			id: "actions",
			header: () => <span className="sr-only">Acciones</span>,
			enableSorting: false,
			cell: ({ row }) => (
				<div className="flex justify-end gap-1">
					<button
						type="button"
						onClick={() => onEdit(row.original)}
						aria-label={`Editar certificado de ${studentName(row.original)}`}
						title="Editar"
						className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
						<Edit className="h-4 w-4" />
					</button>
					<button
						type="button"
						onClick={() => {
							if (
								window.confirm(
									"¿Estás seguro de eliminar este certificado? Esta acción no se puede deshacer.",
								)
							) {
								onDelete(row.original.id);
							}
						}}
						aria-label={`Eliminar certificado de ${studentName(row.original)}`}
						title="Eliminar"
						className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
						<Trash2 className="h-4 w-4" />
					</button>
				</div>
			),
		},
	];
}
