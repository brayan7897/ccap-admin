"use client";

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable";
import { buildCategoriesColumns } from "@/components/tables/columns/categories-columns";
import {
	useCategories,
	useDeleteCategory,
} from "@/features/categories/hooks/useCategories";
import { CategoryModal } from "@/components/shared/CategoryModal";
import type { CategoryResponse } from "@/features/categories/schemas/category.schema";
import { toast } from "sonner";

export default function CategoriesPage() {
	const { data, isLoading, isError } = useCategories();
	const deleteCategory = useDeleteCategory();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<
		CategoryResponse | undefined
	>();

	const handleEdit = (category: CategoryResponse) => {
		setEditingCategory(category);
		setIsModalOpen(true);
	};

	const handleDelete = async (id: string) => {
		if (
			confirm(
				"¿Estás seguro de eliminar esta categoría? Esta acción no se puede deshacer.",
			)
		) {
			try {
				await deleteCategory.mutateAsync(id);
			} catch (error) {
				toast.error("Error al eliminar la categoría");
			}
		}
	};

	const openNewModal = () => {
		setEditingCategory(undefined);
		setIsModalOpen(true);
	};

	const columns = useMemo(
		() => buildCategoriesColumns(handleDelete, handleEdit),
		[],
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Categorías</h2>
					<p className="text-sm text-muted-foreground">
						Gestiona las categorías de los cursos.
					</p>
				</div>
				<button
					onClick={openNewModal}
					className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
					<Plus className="h-4 w-4" />
					Nueva Categoría
				</button>
			</div>

			{isLoading && (
				<p className="text-sm text-muted-foreground">Cargando categorías…</p>
			)}
			{isError && (
				<div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
					Error al cargar categorías. Verifica que la conexión con el servidor
					de CCAP Global.
				</div>
			)}

			{data && (
				<div className="rounded-xl border border-border bg-card shadow-sm">
					<DataTable
						columns={columns}
						data={data}
						searchPlaceholder="Buscar por nombre o slug..."
					/>
				</div>
			)}

			{isModalOpen && (
				<CategoryModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					category={editingCategory}
				/>
			)}
		</div>
	);
}
