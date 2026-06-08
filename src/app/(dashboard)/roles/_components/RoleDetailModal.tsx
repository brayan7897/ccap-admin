"use client";

import type { Role } from "@/types";
import { X, Pencil, Trash2, Shield, Lock } from "lucide-react";
import { Portal } from "@/components/shared/Portal";

interface RoleDetailModalProps {
	role: Role | null;
	isOpen: boolean;
	onClose: () => void;
	onEdit: (id: string) => void;
	onDelete: (id: string) => void;
	onManagePermissions: (id: string) => void;
}

export function RoleDetailModal({
	role,
	isOpen,
	onClose,
	onEdit,
	onDelete,
	onManagePermissions,
}: RoleDetailModalProps) {
	if (!isOpen || !role) return null;

	return (
		<Portal>
			<div
				className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0"
				onClick={(e) => {
					if (e.target === e.currentTarget) onClose();
				}}
			>
			<div className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30 shrink-0">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-md">
							{role.is_system_role ? (
								<Lock className="h-5 w-5 text-primary" />
							) : (
								<Shield className="h-5 w-5 text-primary" />
							)}
						</div>
						<div>
							<h2 className="text-lg font-semibold text-foreground leading-tight">
								{role.name}
							</h2>
							<p className="text-sm text-muted-foreground">
								{role.permission_count ?? 0} permisos
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors self-start"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5 overflow-y-auto space-y-6">
					<div className="rounded-lg border border-border bg-card p-4">
						<p className="text-sm font-medium mb-1">Tipo de Rol</p>
						{role.is_system_role ? (
							<p className="text-sm text-muted-foreground">
								Este es un <strong>rol del sistema</strong>. No puede ser eliminado y algunos permisos clave pueden no ser modificables.
							</p>
						) : (
							<p className="text-sm text-muted-foreground">
								Este es un <strong>rol personalizado</strong> creado por un administrador. Puede ser modificado o eliminado libremente.
							</p>
						)}
					</div>
				</div>

				{/* Footer Actions */}
				<div className="border-t border-border bg-muted/30 px-6 py-4 shrink-0 flex flex-wrap gap-2 justify-end">
					<button
						onClick={() => {
							onClose();
							onManagePermissions(role.id);
						}}
						className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
					>
						<Shield className="h-4 w-4" />
						Gestionar permisos
					</button>
					<button
						onClick={() => {
							onClose();
							onEdit(role.id);
						}}
						className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
					>
						<Pencil className="h-4 w-4" />
						Editar
					</button>
					<button
						onClick={() => {
							if (role.is_system_role) {
								alert("No es posible eliminar un rol del sistema.");
								return;
							}
							if (confirm("¿Estás seguro de eliminar este rol?")) {
								onClose();
								onDelete(role.id);
							}
						}}
						disabled={role.is_system_role}
						className={`inline-flex items-center gap-2 rounded-md border border-destructive bg-transparent px-3 py-2 text-sm font-medium transition-colors ml-auto sm:ml-0 ${
							role.is_system_role 
								? "opacity-50 cursor-not-allowed text-destructive/50" 
								: "text-destructive hover:bg-destructive/10"
						}`}
					>
						<Trash2 className="h-4 w-4" />
						Eliminar
					</button>
				</div>
			</div>
			</div>
		</Portal>
	);
}
