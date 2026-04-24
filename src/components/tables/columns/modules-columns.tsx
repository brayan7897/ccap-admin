"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Module } from "@/types";
import { Trash2 } from "lucide-react";

export function buildModulesColumns(
	onDelete: (id: string) => void,
): ColumnDef<Module, unknown>[] {
	return [
		{
			accessorKey: "title",
			header: "Título",
		},
		{
			accessorKey: "course_id",
			header: "Curso",
		},
		{
			id: "actions",
			header: "Acciones",
			cell: ({ row }) => (
				<button
					onClick={() => onDelete(row.original.id)}
					className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
					title="Eliminar">
					<Trash2 className="h-4 w-4" />
				</button>
			),
		},
	];
}
