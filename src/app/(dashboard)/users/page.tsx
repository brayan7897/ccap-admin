"use client";

import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "@/components/tables/DataTable";
import { buildUsersColumns } from "@/components/tables/columns/users-columns";
import {
	useDeleteUser,
	useUpdateUserAccess,
	useUsers,
} from "@/features/users/hooks/useUsers";
import type { CourseAccess, User } from "@/types";
import { UserModal } from "@/components/shared/UserModal";
import { AccessModal } from "@/components/shared/AccessModal";

const ACCESS_OPTIONS: { value: CourseAccess | "ALL"; label: string }[] = [
	{ value: "ALL", label: "Todo el acceso" },
	{ value: "NONE", label: "Sin acceso" },
	{ value: "PENDING", label: "Pendiente" },
	{ value: "APPROVED", label: "Aprobado" },
	{ value: "REJECTED", label: "Rechazado" },
];

export default function UsersPage() {
	const searchParams = useSearchParams();
	const { data, isLoading, isError } = useUsers();
	const deleteUser = useDeleteUser();
	const updateAccess = useUpdateUserAccess();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [accessFilter, setAccessFilter] = useState<CourseAccess | "ALL">(
		(searchParams.get("access") as CourseAccess | null) ?? "ALL",
	);
	const [accessUser, setAccessUser] = useState<User | null>(null);

	const filteredData = useMemo(() => {
		if (!data) return [];
		if (accessFilter === "ALL") return data;
		return data.filter((u) => u.course_access === accessFilter);
	}, [data, accessFilter]);

	const columns = useMemo(
		() =>
			buildUsersColumns(
				(user) => {
					setEditingUser(user);
					setIsModalOpen(true);
				},
				(id) => deleteUser.mutate(id),
				(user) => setAccessUser(user),
			),
		[deleteUser],
	);

	function handleOpenCreate() {
		setEditingUser(null);
		setIsModalOpen(true);
	}

	function handleCloseModal() {
		setIsModalOpen(false);
		setEditingUser(null);
	}

	const extraFilters = (
		<select
			value={accessFilter}
			onChange={(e) => setAccessFilter(e.target.value as CourseAccess | "ALL")}
			className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
			{ACCESS_OPTIONS.map((o) => (
				<option key={o.value} value={o.value}>
					{o.label}
				</option>
			))}
		</select>
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-foreground">Usuarios</h2>
					<p className="text-sm text-muted-foreground">
						Gestiona los usuarios registrados en la plataforma.
					</p>
				</div>
				<button
					onClick={handleOpenCreate}
					className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
					<UserPlus className="h-4 w-4" />
					Crear usuario
				</button>
			</div>

			{isLoading && (
				<p className="text-sm text-muted-foreground">Cargando usuarios…</p>
			)}
			{isError && (
				<p className="text-sm text-destructive">
					Error al cargar usuarios. Verifica que la API esté disponible.
				</p>
			)}

			{!isLoading && (
				<DataTable
					columns={columns}
					data={filteredData}
					searchPlaceholder="Buscar usuarios…"
					extraFilters={extraFilters}
				/>
			)}
			<UserModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				user={editingUser}
			/>
			<AccessModal
				user={accessUser}
				isOpen={!!accessUser}
				onClose={() => setAccessUser(null)}
				onUpdateAccess={(userId, status) =>
					updateAccess.mutate({ userId, status })
				}
				isLoading={updateAccess.isPending}
			/>
		</div>
	);
}
