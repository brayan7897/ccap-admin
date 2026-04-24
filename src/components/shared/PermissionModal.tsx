"use client";

import { X } from "lucide-react";
import type { Permission } from "@/types";
import { PermissionForm } from "@/components/forms/PermissionForm";
import {
	useCreatePermission,
	useUpdatePermission,
} from "@/features/roles/hooks/useRoles";
import type { PermissionInput } from "@/features/roles/schemas/role.schema";

interface PermissionModalProps {
	isOpen: boolean;
	onClose: () => void;
	permission?: Permission | null;
}

export function PermissionModal({ isOpen, onClose, permission }: PermissionModalProps) {
	const createPermission = useCreatePermission();
	const updatePermission = useUpdatePermission(permission?.id ?? "");

	if (!isOpen) return null;

	const isEditing = !!permission;
	const isLoading = createPermission.isPending || updatePermission.isPending;

	async function handleSubmit(data: PermissionInput) {
		if (!isEditing) {
			createPermission.mutate(data, { onSuccess: onClose });
		} else {
			updatePermission.mutate(
				{ name: data.name, description: data.description },
				{ onSuccess: onClose }
			);
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}>
			<div className="relative w-full max-w-md rounded-xl border border-border bg-background shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between border-b border-border px-6 py-4">
					<h2 className="text-base font-semibold text-foreground">
						{isEditing ? `Editar permiso: ${permission.code}` : "Crear nuevo permiso"}
					</h2>
					<button
						onClick={onClose}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="px-6 py-5">
					<PermissionForm
						mode={isEditing ? "edit" : "create"}
						defaultValues={permission ?? undefined}
						onSubmit={handleSubmit}
						isLoading={isLoading}
					/>
				</div>
			</div>
		</div>
	);
}
