"use client";

import type { CourseAccess, User } from "@/types";
import { X, Pencil, Trash2, Shield, Calendar, Mail, Phone, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserDetailModalProps {
	user: User | null;
	isOpen: boolean;
	onClose: () => void;
	onEdit: (user: User) => void;
	onDelete: (id: string) => void;
	onManageAccess: (user: User) => void;
}

const ACCESS_LABEL: Record<string, string> = {
	NONE: "Sin acceso",
	PENDING: "Pendiente",
	APPROVED: "Aprobado",
	REJECTED: "Rechazado",
};

export function UserDetailModal({
	user,
	isOpen,
	onClose,
	onEdit,
	onDelete,
	onManageAccess,
}: UserDetailModalProps) {
	if (!isOpen || !user) return null;

	const access = (user.course_access ?? "NONE").toUpperCase();

	return (
		<div
			className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30 shrink-0">
					<div>
						<h2 className="text-lg font-semibold text-foreground leading-tight">
							{user.full_name || `${user.first_name} ${user.last_name}`}
						</h2>
						<p className="text-sm text-muted-foreground">{user.email}</p>
					</div>
					<button
						onClick={onClose}
						className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5 overflow-y-auto space-y-6">
					
					{/* Status section */}
					<div className="flex flex-wrap gap-3">
						<div className="flex-1 rounded-lg border border-border p-3 flex items-center justify-between bg-card">
							<span className="text-sm font-medium text-muted-foreground">Cuenta</span>
							<span
								className={cn(
									"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider",
									user.is_active
										? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
										: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
								)}
							>
								{user.is_active ? "Activo" : "Inactivo"}
							</span>
						</div>
						<div className="flex-1 rounded-lg border border-border p-3 flex items-center justify-between bg-card">
							<span className="text-sm font-medium text-muted-foreground">Rol</span>
							<span className="text-sm font-semibold">{user.role?.name ?? user.role_name ?? "—"}</span>
						</div>
					</div>

					{/* Details Grid */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-foreground border-b border-border pb-2">Información Personal</h3>
						
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="flex items-start gap-3">
								<CreditCard className="h-4 w-4 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-xs text-muted-foreground">Documento</p>
									<p className="text-sm font-medium">{user.document_type} {user.document_number}</p>
								</div>
							</div>
							
							<div className="flex items-start gap-3">
								<Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-xs text-muted-foreground">Teléfono</p>
									<p className="text-sm font-medium">{user.phone_number || "—"}</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
								<div className="overflow-hidden">
									<p className="text-xs text-muted-foreground">Email</p>
									<p className="text-sm font-medium truncate">{user.email}</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-xs text-muted-foreground">Fecha de registro</p>
									<p className="text-sm font-medium">
										{new Date(user.created_at).toLocaleDateString("es-PE", {
											day: "2-digit",
											month: "long",
											year: "numeric",
										})}
									</p>
								</div>
							</div>
						</div>

						{user.bio && (
							<div className="pt-2">
								<p className="text-xs text-muted-foreground mb-1">Biografía</p>
								<p className="text-sm p-3 rounded-lg bg-muted/30 border border-border text-foreground">{user.bio}</p>
							</div>
						)}
					</div>

					{/* Access section */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-foreground border-b border-border pb-2">Catálogo de Cursos</h3>
						<div className="rounded-lg border border-border p-4 bg-card flex items-center justify-between">
							<div>
								<p className="text-sm font-medium">Estado de acceso</p>
								<p className="text-xs text-muted-foreground mt-0.5">Permisos para visualizar e inscribirse en cursos.</p>
							</div>
							<span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground">
								{ACCESS_LABEL[access] || access}
							</span>
						</div>
					</div>
				</div>

				{/* Footer Actions */}
				<div className="border-t border-border bg-muted/30 px-6 py-4 shrink-0 flex flex-wrap gap-2 justify-end">
					<button
						onClick={() => {
							onClose();
							onManageAccess(user);
						}}
						className="inline-flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
					>
						<Shield className="h-4 w-4" />
						Gestionar acceso
					</button>
					<button
						onClick={() => {
							onClose();
							onEdit(user);
						}}
						className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
					>
						<Pencil className="h-4 w-4" />
						Editar usuario
					</button>
					<button
						onClick={() => {
							onClose();
							onDelete(user.id);
						}}
						className="inline-flex items-center gap-2 rounded-md border border-destructive bg-transparent px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors ml-auto sm:ml-0"
					>
						<Trash2 className="h-4 w-4" />
						Eliminar
					</button>
				</div>
			</div>
		</div>
	);
}
