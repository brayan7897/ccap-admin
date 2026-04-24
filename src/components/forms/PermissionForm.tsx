"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import {
	permissionSchema,
	type PermissionInput,
} from "@/features/roles/schemas/role.schema";
import type { Permission } from "@/types";

interface PermissionFormProps {
	mode: "create" | "edit";
	defaultValues?: Permission;
	onSubmit: (data: PermissionInput) => void;
	isLoading?: boolean;
}

export function PermissionForm({
	mode,
	defaultValues,
	onSubmit,
	isLoading,
}: PermissionFormProps) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<PermissionInput>({
		resolver: zodResolver(permissionSchema) as unknown as Resolver<PermissionInput>,
		defaultValues:
			mode === "edit" && defaultValues
				? {
						code: defaultValues.code,
						name: defaultValues.name,
						description: defaultValues.description || undefined,
					}
				: {},
	});

	const field =
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

	return (
		<form
			onSubmit={handleSubmit((data) => onSubmit(data))}
			className="space-y-4">
			
			<div className="space-y-1">
				<label className="text-sm font-medium">Código *</label>
				<input
					{...register("code")}
					placeholder="ej. course:create"
					className={field}
					disabled={mode === "edit"} // código no se puede cambiar luego de creado según docs
				/>
				{errors.code && (
					<p className="text-xs text-destructive">{errors.code.message}</p>
				)}
				{mode === "edit" && (
					<p className="text-xs text-muted-foreground">El código no puede ser modificado.</p>
				)}
			</div>

			<div className="space-y-1">
				<label className="text-sm font-medium">Nombre *</label>
				<input
					{...register("name")}
					placeholder="Crear Cursos"
					className={field}
				/>
				{errors.name && (
					<p className="text-xs text-destructive">{errors.name.message}</p>
				)}
			</div>

			<div className="space-y-1">
				<label className="text-sm font-medium">Descripción</label>
				<textarea
					{...register("description")}
					placeholder="Permite crear nuevos cursos en la plataforma"
					className={`${field} h-auto min-h-[80px] resize-none`}
				/>
				{errors.description && (
					<p className="text-xs text-destructive">{errors.description.message}</p>
				)}
			</div>

			<button
				type="submit"
				disabled={isLoading}
				className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
				{isLoading
					? "Guardando…"
					: mode === "create"
						? "Crear permiso"
						: "Guardar cambios"}
			</button>
		</form>
	);
}
