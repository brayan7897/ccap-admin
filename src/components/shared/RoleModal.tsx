"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Save } from "lucide-react";
import { useCreateRole, useUpdateRole } from "@/features/roles/hooks/useRoles";
import type { Role } from "@/types";

const roleSchema = z.object({
	name: z.string().min(1, "El nombre es requerido"),
	description: z.string().optional(),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface RoleModalProps {
	isOpen: boolean;
	onClose: () => void;
	role?: Role | null;
}

export function RoleModal({ isOpen, onClose, role }: RoleModalProps) {
	const createRole = useCreateRole();
	const updateRole = useUpdateRole(role?.id ?? "");

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<RoleFormData>({
		resolver: zodResolver(roleSchema),
		defaultValues: {
			name: "",
			description: "",
		},
	});

	useEffect(() => {
		if (isOpen) {
			reset({
				name: role?.name || "",
				description: role?.description || "",
			});
		}
	}, [isOpen, role, reset]);

	if (!isOpen) return null;

	const onSubmit = async (data: RoleFormData) => {
		try {
			if (role) {
				await updateRole.mutateAsync({
					...data,
					is_system_role: role.is_system_role,
				});
			} else {
				await createRole.mutateAsync({ ...data, is_system_role: false });
			}
			onClose();
		} catch (error) {
			console.error("Error saving role:", error);
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}>
			<div className="relative w-full max-w-md rounded-xl border border-border bg-background shadow-xl mx-4">
				<div className="flex items-center justify-between border-b border-border px-6 py-4">
					<h2 className="text-base font-semibold text-foreground">
						{role ? "Editar Rol" : "Crear Rol"}
					</h2>
					<button
						onClick={onClose}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
						<X className="h-4 w-4" />
					</button>
				</div>

				<form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
					<div className="space-y-2">
						<label htmlFor="name" className="text-sm font-medium">
							Nombre *
						</label>
						<input
							id="name"
							{...register("name")}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
							placeholder="ej. administrador"
						/>
						{errors.name && (
							<p className="text-xs text-destructive">{errors.name.message}</p>
						)}
					</div>
					<div className="space-y-2">
						<label htmlFor="description" className="text-sm font-medium">
							Descripción
						</label>
						<textarea
							id="description"
							{...register("description")}
							className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground min-h-20 focus:outline-none focus:ring-2 focus:ring-ring"
							placeholder="Breve descripción del rol..."
						/>
					</div>

					<div className="pt-4 flex justify-end gap-2 border-t border-border">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-md transition-colors">
							Cancelar
						</button>
						<button
							type="submit"
							disabled={
								isSubmitting || createRole.isPending || updateRole.isPending
							}
							className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50">
							{isSubmitting || createRole.isPending || updateRole.isPending ? (
								"Guardando..."
							) : (
								<>
									<Save className="h-4 w-4" />
									Guardar
								</>
							)}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
