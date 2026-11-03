"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Module } from "@/types";
import { Trash2 } from "lucide-react";

// The "Curso" column was removed: this table is always scoped to a single
// course (?courseId=...) and the page header already shows that course's
// name, so repeating a raw course_id on every row only leaked an id.
export function buildModulesColumns(
	onDelete: (id: string) => void,
): ColumnDef<Module, unknown>[] {
	return [
		{
			accessorKey: "order_index",
			header: "#",
			cell: ({ row }) => (
				<span className="tabular-nums text-muted-foreground">
					{row.original.order_index}
				</span>
			),
		},
		{
			accessorKey: "title",
			header: "Título",
			cell: ({ row }) => (
				<span className="line-clamp-2 font-medium text-foreground" title={row.original.title}>
					{row.original.title}
				</span>
			),
		},
		{
			id: "actions",
			header: () => <span className="sr-only">Acciones</span>,
			enableSorting: false,
			cell: ({ row }) => (
				<div className="flex justify-end">
					<button
						type="button"
						onClick={() => {
							if (
								window.confirm(
									`¿Eliminar el módulo "${row.original.title}"? Esta acción no se puede deshacer.`,
								)
							) {
								onDelete(row.original.id);
							}
						}}
						aria-label={`Eliminar módulo ${row.original.title}`}
						title="Eliminar"
						className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
						<Trash2 className="h-4 w-4" />
					</button>
				</div>
			),
		},
	];
}
