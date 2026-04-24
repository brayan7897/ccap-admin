"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { CategoryResponse } from "@/features/categories/schemas/category.schema";
import { Trash2, Pencil } from "lucide-react";

export function buildCategoriesColumns(
	onDelete: (id: string) => void,
	onEdit: (category: CategoryResponse) => void,
): ColumnDef<CategoryResponse, unknown>[] {
	return [
		{
			accessorKey: "name",
			header: "Nombre",
		},
		{
			accessorKey: "slug",
			header: "Slug",
		},
		{
			accessorKey: "description",
			header: "Descripción",
		},
		{
			id: "actions",
			header: "Acciones",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<button
						onClick={() => onEdit(row.original)}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
						title="Editar">
						<Pencil className="h-4 w-4" />
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