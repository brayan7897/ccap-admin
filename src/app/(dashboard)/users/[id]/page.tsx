"use client";

import { use } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserForm } from "@/components/forms/UserForm";
import {
	useUser,
	useCreateUser,
	useActivateUser,
	useChangeUserRole,
} from "@/features/users/hooks/useUsers";
import type {
	UserCreateInput,
	UserEditInput,
} from "@/features/users/schemas/user.schema";

interface Props {
	params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: Props) {
	const { id } = use(params);
	const isNew = id === "new";
	const router = useRouter();

	const { data: user, isLoading: isLoadingUser } = useUser(isNew ? "" : id);
	const createUser = useCreateUser();
	const activateUser = useActivateUser();
	const changeRole = useChangeUserRole();

	const isPending =
		createUser.isPending || activateUser.isPending || changeRole.isPending;

	async function handleSubmit(data: UserCreateInput | UserEditInput) {
		if (isNew) {
			createUser.mutate(data as UserCreateInput, {
				onSuccess: () => router.push("/users"),
			});
		} else {
			const editData = data as UserEditInput;
			const promises: Promise<unknown>[] = [];

			if (
				editData.is_active !== undefined &&
				user &&
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

			if (editData.role_id && user && editData.role_id !== user.role_id) {
				promises.push(
					new Promise<void>((res, rej) =>
						changeRole.mutate(
							{ id: user.id, role_id: editData.role_id! },
							{ onSuccess: () => res(), onError: rej },
						),
					),
				);
			}

			await Promise.allSettled(promises);
			router.push("/users");
		}
	}

	if (!isNew && isLoadingUser) {
		return (
			<div className="mx-auto max-w-2xl space-y-6">
				<p className="text-sm text-muted-foreground">Cargando usuario…</p>
			</div>
		);
	}

	const userName = user
		? user.full_name || `${user.first_name} ${user.last_name}`
		: "Editar usuario";

	return (
		<div className="mx-auto max-w-2xl space-y-6">
			<Link
				href="/users"
				className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
				<ArrowLeft className="h-4 w-4" />
				Volver a usuarios
			</Link>

			<div>
				<h2 className="text-xl font-semibold text-foreground">
					{isNew ? "Nuevo usuario" : userName}
				</h2>
				<p className="text-sm text-muted-foreground">
					{isNew
						? "Completa los datos para crear un nuevo usuario."
						: "Modifica los datos del usuario."}
				</p>
			</div>

			<div className="rounded-xl border border-border bg-card p-6">
				<UserForm
					mode={isNew ? "create" : "edit"}
					defaultValues={user ?? undefined}
					onSubmit={handleSubmit}
					isLoading={isPending}
				/>
			</div>
		</div>
	);
}
