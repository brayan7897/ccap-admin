"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Permission } from "@/types";
import { Trash2, Edit } from "lucide-react";

interface ActionsProps {
	id: string;
	onEdit: (permission: Permission) => void;
	onDelete: (id: string) => void;
	permission: Permission;
}

function Actions({ id, onEdit, onDelete, permission }: ActionsProps) {
	return (
		<div className="flex items-center gap-2">
			<button
				onClick={() => onEdit(permission)}
				className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
				title="Editar">
				<Edit className="h-4 w-4" />
			</button>
			<button
				onClick={() => onDelete(id)}
				className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
				title="Eliminar">
				<Trash2 className="h-4 w-4" />
			</button>
		</div>
	);
}

export function buildPermissionsColumns(
	onEdit: (permission: Permission) => void,
	onDelete: (id: string) => void,
): ColumnDef<Permission, unknown>[] {
	return [
		{
			accessorKey: "code",
			header: "Código",
			cell: ({ row }) => <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{row.original.code}</span>
		},
		{
			accessorKey: "name",
			header: "Nombre",
		},
		{
			accessorKey: "description",
			header: "Descripción",
			cell: ({ row }) => row.original.description || <span className="text-muted-foreground italic">Sin descripción</span>
		},
		{
			id: "actions",
			header: "Acciones",
			cell: ({ row }) => <Actions id={row.original.id} onEdit={onEdit} onDelete={onDelete} permission={row.original} />,
		},
	];
}
