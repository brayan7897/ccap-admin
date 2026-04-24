"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Role } from "@/types";
import { Trash2, Shield, Pencil } from "lucide-react";

interface ActionsProps {
	id: string;
	onDelete: (id: string) => void;
	onEdit: (id: string) => void;
	onManagePermissions: (id: string) => void;
	isSystemRole?: boolean;
}

function Actions({
	id,
	onDelete,
	onEdit,
	onManagePermissions,
	isSystemRole,
}: ActionsProps) {
	return (
		<div className="flex items-center gap-2">
			<button
				onClick={() => onManagePermissions(id)}
				className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
				title="Gestionar Permisos">
				<Shield className="h-4 w-4" />
			</button>
			<button
				onClick={() => onEdit(id)}
				className="rounded-md p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
				title="Editar Rol">
				<Pencil className="h-4 w-4" />
			</button>
			<button
				onClick={() => onDelete(id)}
				disabled={isSystemRole}
				className={`rounded-md p-1.5 text-muted-foreground transition-colors ${isSystemRole ? "opacity-30 cursor-not-allowed" : "hover:bg-destructive/10 hover:text-destructive"}`}
				title={
					isSystemRole
						? "No es posible eliminar un rol del sistema"
						: "Eliminar"
				}>
				<Trash2 className="h-4 w-4" />
			</button>
		</div>
	);
}

export function buildRolesColumns(
	onDelete: (id: string) => void,
	onEdit: (id: string) => void,
	onManagePermissions: (id: string) => void,
): ColumnDef<Role, unknown>[] {
	return [
		{
			accessorKey: "name",
			header: "Nombre",
		},
		{
			accessorKey: "is_system_role",
			header: "Sistema",
			cell: ({ row }) => (row.original.is_system_role ? "Sí" : "No"),
		},
		{
			accessorKey: "permission_count",
			header: "Permisos",
		},
		{
			id: "actions",
			header: "Acciones",
			cell: ({ row }) => {
				return (
					<Actions
						id={row.original.id}
						onDelete={onDelete}
						onEdit={onEdit}
						onManagePermissions={onManagePermissions}
						isSystemRole={row.original.is_system_role}
					/>
				);
			},
		},
	];
}
