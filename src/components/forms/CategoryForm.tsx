"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import {
	categorySchema,
	type CategoryInput,
	type CategoryResponse,
} from "@/features/categories/schemas/category.schema";
import {
	useCreateCategory,
	useUpdateCategory,
} from "@/features/categories/hooks/useCategories";

interface CategoryFormProps {
	initialData?: CategoryResponse;
	onSuccess?: () => void;
	onCancel?: () => void;
}

export function CategoryForm({
	initialData,
	onSuccess,
	onCancel,
}: CategoryFormProps) {
	const createCategory = useCreateCategory();
	const updateCategory = useUpdateCategory(initialData?.id || "");

	const isEdit = !!initialData;
	const isSubmitting = createCategory.isPending || updateCategory.isPending;

	const {
		register,
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<CategoryInput>({
		resolver: zodResolver(categorySchema),
		defaultValues: {
			name: initialData?.name || "",
			slug: initialData?.slug || "",
			description: initialData?.description || "",
		},
	});

	// Auto-generate slug from name if not edit
	useEffect(() => {
		if (!isEdit) {
			const nameInput = document.getElementById("name") as HTMLInputElement;
			if (nameInput) {
				nameInput.addEventListener("input", (e) => {
					const target = e.target as HTMLInputElement;
					setValue(
						"slug",
						target.value
							.toLowerCase()
							.replace(/[^a-z0-9]+/g, "-")
							.replace(/^-+|-+$/g, ""),
					);
				});
			}
		}
	}, [isEdit, setValue]);

	const onSubmit = async (data: CategoryInput) => {
		if (isEdit) {
			await updateCategory.mutateAsync(data);
		} else {
			await createCategory.mutateAsync(data);
		}
		onSuccess?.();
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-2">
				<label htmlFor="name" className="text-sm font-medium">
					Nombre
				</label>
				<input
					id="name"
					{...register("name")}
					className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder="Ej. Programación"
				/>
				{errors.name && (
					<p className="text-xs text-destructive">{errors.name.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<label htmlFor="slug" className="text-sm font-medium">
					Slug
				</label>
				<input
					id="slug"
					{...register("slug")}
					className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder="ej-programacion"
				/>
				{errors.slug && (
					<p className="text-xs text-destructive">{errors.slug.message}</p>
				)}
			</div>

			<div className="space-y-2">
				<label htmlFor="description" className="text-sm font-medium">
					Descripción
				</label>
				<textarea
					id="description"
					{...register("description")}
					className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					placeholder="Opcional..."
				/>
				{errors.description && (
					<p className="text-xs text-destructive">
						{errors.description.message}
					</p>
				)}
			</div>

			<div className="flex justify-end gap-2 pt-4">
				{onCancel && (
					<button
						type="button"
						onClick={onCancel}
						disabled={isSubmitting}
						className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted">
						Cancelar
					</button>
				)}
				<button
					type="submit"
					disabled={isSubmitting}
					className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
					{isSubmitting
						? "Guardando..."
						: isEdit
							? "Guardar Cambios"
							: "Crear Categoría"}
				</button>
			</div>
		</form>
	);
}
