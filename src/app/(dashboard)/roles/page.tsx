"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { buildRolesColumns } from "@/components/tables/columns/roles-columns";
import { buildPermissionsColumns } from "@/components/tables/columns/permissions-columns";
import {
	useRoles,
	useDeleteRole,
	usePermissions as useGlobalPermissions,
	useDeletePermission,
} from "@/features/roles/hooks/useRoles";
import { RolePermissionsModal } from "@/components/shared/RolePermissionsModal";
import { PermissionModal } from "@/components/shared/PermissionModal";
import { RoleModal } from "@/components/shared/RoleModal";
import type { Role, Permission } from "@/types";
import { usePermissions } from "@/hooks/usePermissions";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RolesPage() {
	const {
		data: rolesData,
		isLoading: isLoadingRoles,
		isError: isErrorRoles,
	} = useRoles();
	const deleteRole = useDeleteRole();

	const {
		data: permsData,
		isLoading: isLoadingPerms,
		isError: isErrorPerms,
	} = useGlobalPermissions();
	const deletePermission = useDeletePermission();

	const { hasPermission } = usePermissions();
	const isAdmin = hasPermission("admin:access");

	const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");

	// State for Modals
	const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<Role | null>(
		null,
	);
	const [selectedRole, setSelectedRole] = useState<Role | null | undefined>(
		undefined,
	);
	const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
	const [selectedPermission, setSelectedPermission] = useState<
		Permission | null | undefined
	>(undefined);
	const [isPermModalOpen, setIsPermModalOpen] = useState(false);

	useEffect(() => {
		if (rolesData) {
			console.log("[RolesPage] rolesData", rolesData);
		}
		if (permsData) {
			console.log("[RolesPage] permsData", permsData);
		}
	}, [rolesData, permsData]);

	const rolesColumns = useMemo(
		() =>
			buildRolesColumns(
				(id) => {
					if (confirm("¿Estás seguro de eliminar este rol?"))
						deleteRole.mutate(id);
				},
				(id) => {
					const role = rolesData?.find((r) => r.id === id);
					if (role) {
						setSelectedRole(role);
						setIsRoleModalOpen(true);
					}
				},
				(id) => {
					const role = rolesData?.find((r) => r.id === id);
					if (role) setSelectedRoleForPerms(role);
				},
			),
		[deleteRole, rolesData],
	);

	const permsColumns = useMemo(
		() =>
			buildPermissionsColumns(
				(perm) => {
					setSelectedPermission(perm);
					setIsPermModalOpen(true);
				},
				(id) => {
					if (
						confirm(
							"¿Estás seguro de eliminar este permiso? Esto removerá el permiso de todos los roles asociados.",
						)
					)
						deletePermission.mutate(id);
				},
			),
		[deletePermission],
	);

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-foreground">
					Gestión de Acceso
				</h2>
				<p className="text-sm text-muted-foreground">
					Administra los roles y configura los permisos globales del sistema.
				</p>
			</div>

			<div className="flex space-x-1 border-b border-border">
				<button
					onClick={() => setActiveTab("roles")}
					className={cn(
						"px-4 py-2 text-sm font-medium transition-colors border-b-2",
						activeTab === "roles"
							? "border-primary text-foreground"
							: "border-transparent text-muted-foreground hover:text-foreground",
					)}>
					Roles
				</button>
				{isAdmin && (
					<button
						onClick={() => setActiveTab("permissions")}
						className={cn(
							"px-4 py-2 text-sm font-medium transition-colors border-b-2",
							activeTab === "permissions"
								? "border-primary text-foreground"
								: "border-transparent text-muted-foreground hover:text-foreground",
						)}>
						Permisos Globales
					</button>
				)}
			</div>

			{activeTab === "roles" && (
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<h3 className="text-lg font-medium">Todos los Roles</h3>
						<button
							onClick={() => {
								setSelectedRole(null);
								setIsRoleModalOpen(true);
							}}
							className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring gap-2">
							<Plus className="h-4 w-4" />
							Crear Rol
						</button>
					</div>

					{isLoadingRoles && (
						<p className="text-sm text-muted-foreground">Cargando roles…</p>
					)}
					{isErrorRoles && (
						<p className="text-sm text-destructive">
							Error al cargar roles. Verifica que la API esté disponible.
						</p>
					)}
					{rolesData && (
						<DataTable
							columns={rolesColumns}
							data={rolesData}
							searchPlaceholder="Buscar roles…"
						/>
					)}
				</div>
			)}

			{activeTab === "permissions" && isAdmin && (
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<h3 className="text-lg font-medium">Todos los Permisos</h3>
						<button
							onClick={() => {
								setSelectedPermission(null);
								setIsPermModalOpen(true);
							}}
							className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring gap-2">
							<Plus className="h-4 w-4" />
							Crear Permiso
						</button>
					</div>

					{isLoadingPerms && (
						<p className="text-sm text-muted-foreground">Cargando permisos…</p>
					)}
					{isErrorPerms && (
						<p className="text-sm text-destructive">
							Error al cargar permisos.
						</p>
					)}
					{permsData && (
						<DataTable
							columns={permsColumns}
							data={permsData}
							searchPlaceholder="Buscar permisos por nombre o código…"
						/>
					)}
				</div>
			)}

			{/* Modals */}
			<RolePermissionsModal
				isOpen={!!selectedRoleForPerms}
				onClose={() => setSelectedRoleForPerms(null)}
				role={selectedRoleForPerms}
			/>

			{isRoleModalOpen && (
				<RoleModal
					isOpen={isRoleModalOpen}
					onClose={() => {
						setIsRoleModalOpen(false);
						setSelectedRole(null);
					}}
					role={selectedRole}
				/>
			)}

			{isPermModalOpen && (
				<PermissionModal
					isOpen={isPermModalOpen}
					onClose={() => setIsPermModalOpen(false)}
					permission={selectedPermission}
				/>
			)}
		</div>
	);
}
