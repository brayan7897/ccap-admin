"use client";

import { useMemo, useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import type { Role } from "@/types";
import {
	usePermissions,
	useRole,
	useAssignPermission,
	useRevokePermission,
} from "@/features/roles/hooks/useRoles";
import { cn } from "@/lib/utils";

interface RolePermissionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	role?: Role | null;
}

export function RolePermissionsModal({
	isOpen,
	onClose,
	role,
}: RolePermissionsModalProps) {
	const { data: fullRole, isLoading: isLoadingRole } = useRole(role?.id ?? "");
	const { data: allPermissions, isLoading: isLoadingPerms } = usePermissions();
	const assignPermission = useAssignPermission(role?.id ?? "");
	const revokePermission = useRevokePermission(role?.id ?? "");

	const [togglingId, setTogglingId] = useState<string | null>(null);

	// O(1) lookup map of assigned permissions
	const assignedPermsMap = useMemo(() => {
		const map = new Set<string>();
		if (fullRole?.permissions) {
			for (const p of fullRole.permissions) {
				map.add(p.id);
			}
		}
		return map;
	}, [fullRole?.permissions]);

	const handleToggle = async (permissionId: string, currentlyHas: boolean) => {
		setTogglingId(permissionId);
		try {
			if (currentlyHas) {
				await revokePermission.mutateAsync(permissionId);
			} else {
				await assignPermission.mutateAsync({ permission_id: permissionId });
			}
		} finally {
			setTogglingId(null);
		}
	};

	if (!isOpen || !role) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}>
			<div className="relative w-full max-w-2xl rounded-xl border border-border bg-background shadow-xl mx-4 max-h-[90vh] flex flex-col">
				<div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
					<div>
						<h2 className="text-base font-semibold text-foreground flex items-center gap-2">
							<ShieldCheck className="h-4 w-4 text-primary" /> Permisos del Rol
						</h2>
						<p className="text-sm text-muted-foreground mt-0.5">
							Editando:{" "}
							<span className="font-medium text-foreground">{role.name}</span>
						</p>
					</div>
					<button
						onClick={onClose}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors self-start">
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="px-6 py-5 overflow-y-auto min-h-75">
					{isLoadingPerms || isLoadingRole ? (
						<p className="text-sm text-muted-foreground">
							Cargando permisos e información del rol...
						</p>
					) : (
						<div className="space-y-3">
							{allPermissions?.map((perm) => {
								const hasPerm = assignedPermsMap.has(perm.id);
								const isToggling = togglingId === perm.id;

								return (
									<div
										key={perm.id}
										className="flex items-start justify-between p-3 border border-border rounded-md hover:bg-muted/30 transition-colors">
										<div className="flex flex-col gap-1 pr-4">
											<span className="text-sm font-medium text-foreground">
												{perm.name}
											</span>
											<span className="text-xs font-mono text-muted-foreground">
												{perm.code}
											</span>
											{perm.description && (
												<p className="text-xs text-muted-foreground/80 mt-1">
													{perm.description}
												</p>
											)}
										</div>
										<button
											disabled={isToggling}
											onClick={() => handleToggle(perm.id, hasPerm)}
											className={cn(
												"shrink-0 rounded-full h-5 w-9 flex items-center transition-all p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
												hasPerm
													? "bg-primary justify-end"
													: "bg-input justify-start",
												isToggling && "opacity-50 cursor-not-allowed",
											)}>
											<div className="bg-background rounded-full h-4 w-4 shadow-sm transition-transform" />
										</button>
									</div>
								);
							})}

							{allPermissions?.length === 0 && (
								<p className="text-sm text-muted-foreground">
									No hay permisos globales registrados en el sistema.
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
