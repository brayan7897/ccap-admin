"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { CourseAccess, User } from "@/types";
import { Pencil, Trash2, ShieldAlert, ShieldCheck, Shield, ShieldX } from "lucide-react";

const ACCESS_BADGE: Record<CourseAccess, { label: string; className: string }> =
	{
		NONE: {
			label: "Sin acceso",
			className:
				"bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
		},
		PENDING: {
			label: "Pendiente",
			className:
				"bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
		},
		APPROVED: {
			label: "Aprobado",
			className:
				"bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
		},
		REJECTED: {
			label: "Rechazado",
			className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		},
	};

/** Clickable badge that opens the access management modal */
function AccessBadge({
	user,
	onManageAccess,
}: {
	user: User;
	onManageAccess: (user: User) => void;
}) {
	const access = (
		(user.course_access ?? "NONE") as string
	).toUpperCase() as CourseAccess;
	const badge = ACCESS_BADGE[access] ?? ACCESS_BADGE.NONE;

	const Icon =
		access === "APPROVED"
			? ShieldCheck
			: access === "REJECTED"
				? ShieldX
				: access === "PENDING"
					? ShieldAlert
					: Shield;

	return (
		<button
			type="button"
			onClick={() => onManageAccess(user)}
			title="Gestionar acceso a cursos"
			className={`group inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
				access === "NONE"
					? "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-gray-700"
					: access === "PENDING"
						? "border-yellow-200 bg-yellow-50 text-yellow-700 hover:border-yellow-300 hover:bg-yellow-100 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:border-yellow-900/70"
						: access === "APPROVED"
							? "border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400 dark:hover:border-green-900/70"
							: "border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:border-red-900/70"
			}`}>
			<Icon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
			{badge.label}
		</button>
	);
}

interface ActionsProps {
	user: User;
	onEdit: (user: User) => void;
	onDelete: (id: string) => void;
}

function Actions({ user, onEdit, onDelete }: ActionsProps) {
	return (
		<div className="flex items-center gap-1">
			<button
				className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
				title="Editar"
				onClick={() => onEdit(user)}>
				<Pencil className="h-4 w-4" />
			</button>
			<button
				onClick={() => onDelete(user.id)}
				className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
				title="Eliminar">
				<Trash2 className="h-4 w-4" />
			</button>
		</div>
	);
}

export function buildUsersColumns(
	onEdit: (user: User) => void,
	onDelete: (id: string) => void,
	onManageAccess: (user: User) => void,
): ColumnDef<User, unknown>[] {
	return [
		{
			accessorKey: "full_name",
			header: "Nombre",
			cell: ({ row }) => (
				<span className="font-medium text-foreground">
					{row.original.full_name ||
						`${row.original.first_name} ${row.original.last_name}`}
				</span>
			),
		},
		{
			accessorKey: "email",
			header: "Email",
		},
		{
			accessorKey: "role",
			header: "Rol",
			cell: ({ row }) =>
				row.original.role?.name ?? row.original.role_name ?? "—",
		},
		{
			accessorKey: "document_type",
			header: "Doc.",
			cell: ({ row }) =>
				`${row.original.document_type} · ${row.original.document_number}`,
		},
		{
			accessorKey: "is_active",
			header: "Cuenta",
			cell: ({ row }) => (
				<span
					className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
						row.original.is_active
							? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
							: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
					}`}>
					{row.original.is_active ? "Activo" : "Inactivo"}
				</span>
			),
		},
		{
			accessorKey: "course_access",
			header: "Acceso cursos",
			cell: ({ row }) => (
				<AccessBadge user={row.original} onManageAccess={onManageAccess} />
			),
		},
		{
			accessorKey: "created_at",
			header: "Registro",
			enableSorting: true,
			cell: ({ row }) =>
				new Date(row.original.created_at).toLocaleDateString("es-PE", {
					day: "2-digit",
					month: "short",
					year: "numeric",
				}),
		},
		{
			id: "actions",
			header: "Acciones",
			cell: ({ row }) => (
				<Actions user={row.original} onEdit={onEdit} onDelete={onDelete} />
			),
		},
	];
}
