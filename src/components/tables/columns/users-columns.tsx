"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { CourseAccess, User } from "@/types";
import { Pencil, Trash2, ShieldAlert, ShieldCheck, Shield, ShieldX, Chrome, KeyRound } from "lucide-react";

const AUTH_PROVIDER_BADGE: Record<
	NonNullable<User["auth_provider"]>,
	{ label: string; className: string; icon: typeof Chrome }
> = {
	google: {
		label: "Google",
		className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
		icon: Chrome,
	},
	local: {
		label: "Manual",
		className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
		icon: KeyRound,
	},
	pending: {
		label: "Sin acceso aún",
		className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
		icon: KeyRound,
	},
};

/** Shows how the user signed up: Google OAuth vs. email/password */
function AuthProviderBadge({ user }: { user: User }) {
	if (!user.auth_provider) return null;
	const badge = AUTH_PROVIDER_BADGE[user.auth_provider];
	const Icon = badge.icon;
	return (
		<span
			className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${badge.className}`}>
			<Icon className="h-3 w-3" />
			{badge.label}
		</span>
	);
}

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
			onClick={(e) => {
				e.stopPropagation();
				e.preventDefault();
				onManageAccess(user);
			}}
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
				onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					onEdit(user);
				}}>
				<Pencil className="h-4 w-4" />
			</button>
			<button
				onClick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					onDelete(user.id);
				}}
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
			cell: ({ row }) => (
				<div className="flex flex-col items-start gap-1">
					<span>{row.original.email}</span>
					<AuthProviderBadge user={row.original} />
				</div>
			),
		},
		{
			accessorKey: "role",
			header: "Rol",
			cell: ({ row }) =>
				row.original.role?.name ?? row.original.role_name ?? "—",
			meta: { className: "hidden lg:table-cell" },
		},
		{
			accessorKey: "document_type",
			header: "Doc.",
			cell: ({ row }) =>
				`${row.original.document_type} · ${row.original.document_number}`,
			meta: { className: "hidden xl:table-cell" },
		},
		{
			accessorKey: "is_active",
			header: "Cuenta",
			cell: ({ row }) => (
				<div className="flex flex-col items-start gap-1">
					<span
						className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
							row.original.is_active
								? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
								: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
						}`}>
						{row.original.is_active ? "Activo" : "Inactivo"}
					</span>
					{row.original.is_claimed === false && (
						<span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
							Cuenta provisional
						</span>
					)}
				</div>
			),
			meta: { className: "hidden lg:table-cell" },
		},
		{
			accessorKey: "course_access",
			header: "Acceso cursos",
			cell: ({ row }) => (
				<AccessBadge user={row.original} onManageAccess={onManageAccess} />
			),
			meta: { className: "hidden xl:table-cell" },
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
			meta: { className: "hidden 2xl:table-cell" },
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
