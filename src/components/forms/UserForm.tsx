"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import {
	userCreateSchema,
	userEditSchema,
	type UserCreateInput,
	type UserEditInput,
} from "@/features/users/schemas/user.schema";
import { useRoles } from "@/features/roles/hooks/useRoles";
import type { User } from "@/types";

const DOC_TYPES = ["DNI", "CE", "PASAPORTE"] as const;

interface UserFormProps {
	mode: "create" | "edit";
	defaultValues?: User;
	onSubmit: (data: UserCreateInput | UserEditInput) => void;
	isLoading?: boolean;
}

export function UserForm({
	mode,
	defaultValues,
	onSubmit,
	isLoading,
}: UserFormProps) {
	const schema = mode === "create" ? userCreateSchema : userEditSchema;
	const { data: roles, isLoading: isLoadingRoles } = useRoles();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<UserCreateInput>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(schema) as unknown as Resolver<UserCreateInput>,
		defaultValues:
			mode === "edit" && defaultValues
				? {
						first_name: defaultValues.first_name,
						last_name: defaultValues.last_name,
						document_type: defaultValues.document_type as
							| "DNI"
							| "CE"
							| "PASAPORTE",
						document_number: defaultValues.document_number,
						phone_number: defaultValues.phone_number ?? undefined,
						role_id: defaultValues.role_id,
						is_active: defaultValues.is_active,
					}
				: { document_type: "DNI", is_active: true },
	});

	const field =
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

	return (
		<form
			onSubmit={handleSubmit((data) => onSubmit(data))}
			className="space-y-4">
			{/* Name row */}
			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1">
					<label className="text-sm font-medium">Nombre *</label>
					<input
						{...register("first_name")}
						placeholder="Ana"
						className={field}
					/>
					{errors.first_name && (
						<p className="text-xs text-destructive">
							{errors.first_name.message}
						</p>
					)}
				</div>
				<div className="space-y-1">
					<label className="text-sm font-medium">Apellido *</label>
					<input
						{...register("last_name")}
						placeholder="García"
						className={field}
					/>
					{errors.last_name && (
						<p className="text-xs text-destructive">
							{errors.last_name.message}
						</p>
					)}
				</div>
			</div>

			{/* Email — only on create */}
			{mode === "create" && (
				<div className="space-y-1">
					<label className="text-sm font-medium">Email *</label>
					<input
						{...register("email")}
						type="email"
						placeholder="usuario@ejemplo.com"
						className={field}
					/>
					{"email" in errors && errors.email && (
						<p className="text-xs text-destructive">
							{(errors.email as { message?: string }).message}
						</p>
					)}
				</div>
			)}

			{/* Password — only on create */}
			{mode === "create" && (
				<div className="space-y-1">
					<label className="text-sm font-medium">Contraseña *</label>
					<input
						{...register("password")}
						type="password"
						placeholder="Mínimo 8 caracteres"
						className={field}
					/>
					{"password" in errors && errors.password && (
						<p className="text-xs text-destructive">
							{(errors.password as { message?: string }).message}
						</p>
					)}
				</div>
			)}

			{/* Document */}
			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-1">
					<label className="text-sm font-medium">Tipo de doc. *</label>
					<select {...register("document_type")} className={field}>
						{DOC_TYPES.map((t) => (
							<option key={t} value={t}>
								{t}
							</option>
						))}
					</select>
				</div>
				<div className="space-y-1">
					<label className="text-sm font-medium">N.º de documento *</label>
					<input
						{...register("document_number")}
						placeholder="12345678"
						className={field}
					/>
					{errors.document_number && (
						<p className="text-xs text-destructive">
							{errors.document_number.message}
						</p>
					)}
				</div>
			</div>

			{/* Phone */}
			<div className="space-y-1">
				<label className="text-sm font-medium">Teléfono</label>
				<input
					{...register("phone_number")}
					placeholder="+51 999 000 000"
					className={field}
				/>
			</div>

			{/* Role ID */}
			<div className="space-y-1">
				<label className="text-sm font-medium">Rol</label>
				<select
					{...register("role_id")}
					className={field}
					disabled={isLoadingRoles}>
					<option value="">(Sin rol definido)</option>
					{roles?.map((role) => (
						<option key={role.id} value={role.id}>
							{role.name}
						</option>
					))}
				</select>
				{"role_id" in errors && errors.role_id && (
					<p className="text-xs text-destructive">
						{(errors.role_id as { message?: string }).message}
					</p>
				)}
			</div>

			{/* Is active */}
			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id="is_active"
					{...register("is_active")}
					className="h-4 w-4"
				/>
				<label htmlFor="is_active" className="text-sm font-medium">
					Cuenta activa
				</label>
			</div>

			<button
				type="submit"
				disabled={isLoading}
				className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
				{isLoading
					? "Guardando…"
					: mode === "create"
						? "Crear usuario"
						: "Guardar cambios"}
			</button>
		</form>
	);
}
