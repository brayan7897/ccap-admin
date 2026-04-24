"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Certificate } from "@/types";
import { Trash2, Edit } from "lucide-react";

export function buildCertificatesColumns(
	onEdit: (cert: Certificate) => void,
	onDelete: (id: string) => void,
	userMap: Record<string, string> = {},
	courseMap: Record<string, string> = {},
): ColumnDef<Certificate, unknown>[] {
	return [
		{
			accessorKey: "user_id",
			header: "Estudiante",
			cell: ({ row }) => userMap[row.original.user_id] ?? row.original.user_id,
		},
		{
			accessorKey: "course_id",
			header: "Curso",
			cell: ({ row }) =>
				courseMap[row.original.course_id] ?? row.original.course_id,
		},
		{
			accessorKey: "certificate_code",
			header: "Código",
		},
		{
			accessorKey: "issued_at",
			header: "Emitido",
			cell: ({ row }) =>
				new Date(row.original.issued_at).toLocaleDateString("es-PE"),
		},
		{
			id: "actions",
			header: "Acciones",
			cell: ({ row }) => (
				<div className="flex gap-2">
					<button
						onClick={() => onEdit(row.original)}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
						title="Editar">
						<Edit className="h-4 w-4" />
					</button>
					<button
						onClick={() => onDelete(row.original.id)}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
						title="Eliminar">
						<Trash2 className="h-4 w-4" />
					</button>
				</div>
			),
		},
	];
}
