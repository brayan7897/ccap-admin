"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Lesson } from "@/types";
import { FolderOpen, Trash2 } from "lucide-react";

export function buildLessonsColumns(
	onDelete: (id: string) => void,
): ColumnDef<Lesson, unknown>[] {
	return [
		{
			accessorKey: "order_index",
			header: "#",
			cell: ({ row }) => (
				<span className="text-muted-foreground">
					{row.original.order_index}
				</span>
			),
		},
		{
			accessorKey: "title",
			header: "Título",
		},
		{
			accessorKey: "lesson_type",
			header: "Tipo",
			cell: ({ row }) => (
				<span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
					{row.original.lesson_type}
				</span>
			),
		},
		{
			id: "drive_folder",
			header: "Carpeta Drive",
			cell: ({ row }) => {
				const url = row.original.drive_folder_url;
				if (!url)
					return <span className="text-muted-foreground text-xs">—</span>;
				return (
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
						title="Abrir carpeta en Drive">
						<FolderOpen className="h-4 w-4 shrink-0" />
						<span className="max-w-45 truncate text-xs">
							{row.original.drive_folder_id}
						</span>
					</a>
				);
			},
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
