"use client";

import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { UserFilters } from "./_components/UserFilters";
import { UserCard } from "./_components/UserCard";
import { UserDetailModal } from "./_components/UserDetailModal";
import { ResetPasswordModal } from "./_components/ResetPasswordModal";

const ACCESS_OPTIONS: { value: CourseAccess | "ALL"; label: string }[] = [
	{ value: "ALL", label: "Todo el acceso" },
	{ value: "NONE", label: "Sin acceso" },
	{ value: "PENDING", label: "Pendiente" },
	{ value: "APPROVED", label: "Aprobado" },
	{ value: "REJECTED", label: "Rechazado" },
];

export function UsersPageClient() {
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

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedViewUser, setSelectedViewUser] = useState<User | null>(null);
	const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);

	const filteredData = useMemo(() => {
		if (!data) return [];
		return data.filter((u) => {
			const matchesAccess = accessFilter === "ALL" || u.course_access === accessFilter;
			const search = searchQuery.toLowerCase();
			const matchesSearch =
				!search ||
				u.first_name.toLowerCase().includes(search) ||
				u.last_name.toLowerCase().includes(search) ||
				u.email.toLowerCase().includes(search) ||
				(u.document_number && u.document_number.includes(search));
			
			return matchesAccess && matchesSearch;
		});
	}, [data, accessFilter, searchQuery]);

	const columns = useMemo(
		() =>
			buildUsersColumns(
				(user) => {
					setEditingUser(user);
					setIsModalOpen(true);
				},
				(id) => {
					if (
						window.confirm(
							"¿Eliminar este usuario? Esta acción no se puede deshacer.",
						)
					) {
						deleteUser.mutate(id);
					}
				},
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

	function handleDeleteUser(id: string) {
		if (window.confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) {
			deleteUser.mutate(id);
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-foreground">Usuarios</h2>
					<p className="text-sm text-muted-foreground">
						Gestiona los usuarios registrados en la plataforma.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Link
						href="/users/password-resets"
						className="inline-flex items-center gap-2 rounded-md bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-border">
						Solicitudes de contraseña
					</Link>
					<button
						onClick={handleOpenCreate}
						className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
						<UserPlus className="h-4 w-4" />
						Crear usuario
					</button>
				</div>
			</div>

			{isLoading && (
				<p className="text-sm text-muted-foreground">Cargando usuarios…</p>
			)}
			{isError && (
				<p className="text-sm text-destructive">
					Error al cargar usuarios. Verifica que la API esté disponible.
				</p>
			)}

			{!isLoading && !isError && (
				<>
					{/* Filtros */}
					<UserFilters
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						accessFilter={accessFilter}
						onAccessChange={setAccessFilter}
					/>

					{/* Desktop Table (Hidden on small screens) */}
					<div className="hidden md:block">
						<DataTable
							columns={columns}
							data={filteredData}
							searchPlaceholder="Buscar en resultados..."
							hideSearch
							onRowClick={setSelectedViewUser}
						/>
					</div>

					{/* Mobile/Tablet Cards (Hidden on md and larger) */}
					<div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
						{filteredData.length > 0 ? (
							filteredData.map((user) => (
									<UserCard
										key={user.id}
										user={user}
										onClick={() => setSelectedViewUser(user)}
										onManageAccess={setAccessUser}
									/>
							))
						) : (
							<div className="col-span-full py-8 text-center text-sm text-muted-foreground bg-card border border-border rounded-xl">
								No se encontraron usuarios que coincidan con los filtros.
							</div>
						)}
					</div>
				</>
			)}
			<UserModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				user={editingUser}
				onResetPassword={setResetPasswordUser}
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
			<UserDetailModal
				user={selectedViewUser}
				isOpen={!!selectedViewUser}
				onClose={() => setSelectedViewUser(null)}
				onEdit={(user) => {
					setEditingUser(user);
					setIsModalOpen(true);
				}}
				onDelete={handleDeleteUser}
				onManageAccess={setAccessUser}
				onResetPassword={setResetPasswordUser}
			/>
			<ResetPasswordModal
				user={resetPasswordUser}
				isOpen={!!resetPasswordUser}
				onClose={() => setResetPasswordUser(null)}
			/>
		</div>
	);
}
