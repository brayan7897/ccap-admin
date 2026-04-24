"use client";

import { X } from "lucide-react";
import type { User } from "@/types";
import { UserForm } from "@/components/forms/UserForm";
import {
	useCreateUser,
	useActivateUser,
	useChangeUserRole,
} from "@/features/users/hooks/useUsers";
import type {
	UserCreateInput,
	UserEditInput,
} from "@/features/users/schemas/user.schema";

interface UserModalProps {
	isOpen: boolean;
	onClose: () => void;
	user?: User | null;
}

export function UserModal({ isOpen, onClose, user }: UserModalProps) {
	const createUser = useCreateUser();
	const activateUser = useActivateUser();
	const changeRole = useChangeUserRole();

	if (!isOpen) return null;

	const isEditing = !!user;
	const isLoading =
		createUser.isPending || activateUser.isPending || changeRole.isPending;

	async function handleSubmit(data: UserCreateInput | UserEditInput) {
		if (!isEditing) {
			createUser.mutate(data as UserCreateInput, { onSuccess: onClose });
		} else {
			const editData = data as UserEditInput;
			const promises: Promise<unknown>[] = [];

			if (
				editData.is_active !== undefined &&
				editData.is_active !== user.is_active
			) {
				promises.push(
					new Promise<void>((res, rej) =>
						activateUser.mutate(
							{ id: user.id, is_active: editData.is_active! },
							{ onSuccess: () => res(), onError: rej },
						),
					),
				);
			}

			if (editData.role_id && editData.role_id !== user.role_id) {
				promises.push(
					new Promise<void>((res, rej) =>
						changeRole.mutate(
							{ id: user.id, role_id: editData.role_id! },
							{ onSuccess: () => res(), onError: rej },
						),
					),
				);
			}

			if (promises.length === 0) {
				onClose();
				return;
			}

			await Promise.allSettled(promises);
			onClose();
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}>
			<div className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border px-6 py-4">
					<h2 className="text-base font-semibold text-foreground">
						{isEditing
							? `Editar usuario — ${user.full_name || `${user.first_name} ${user.last_name}`}`
							: "Crear nuevo usuario"}
					</h2>
					<button
						onClick={onClose}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5">
					<UserForm
						mode={isEditing ? "edit" : "create"}
						defaultValues={user ?? undefined}
						onSubmit={handleSubmit}
						isLoading={isLoading}
					/>
				</div>
			</div>
		</div>
	);
}
