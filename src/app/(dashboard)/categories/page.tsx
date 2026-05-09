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
import { CategoryFilters } from "./_components/CategoryFilters";
import { CategoryCard } from "./_components/CategoryCard";
import { CategoryDetailModal } from "./_components/CategoryDetailModal";

export default function CategoriesPage() {
	const { data, isLoading, isError } = useCategories();
	const deleteCategory = useDeleteCategory();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<CategoryResponse | undefined>();
	const [viewingCategory, setViewingCategory] = useState<CategoryResponse | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

	const filteredData = useMemo(() => {
		if (!data) return [];
		const search = searchQuery.toLowerCase();
		return data.filter((c) => 
			!search || c.name.toLowerCase().includes(search) || c.slug.toLowerCase().includes(search)
		);
	}, [data, searchQuery]);

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

			{!isLoading && !isError && (
				<>
					<CategoryFilters
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
					/>

					<div className="hidden md:block rounded-xl border border-border bg-card shadow-sm">
						<DataTable
							columns={columns}
							data={filteredData}
							searchPlaceholder="Buscar por nombre o slug..."
							hideSearch
							onRowClick={setViewingCategory}
						/>
					</div>

					<div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
						{filteredData.length > 0 ? (
							filteredData.map((category) => (
								<CategoryCard
									key={category.id}
									category={category}
									onClick={() => setViewingCategory(category)}
								/>
							))
						) : (
							<div className="col-span-full py-8 text-center text-sm text-muted-foreground bg-card border border-border rounded-xl">
								No se encontraron categorías que coincidan con la búsqueda.
							</div>
						)}
					</div>
				</>
			)}

			{isModalOpen && (
				<CategoryModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					category={editingCategory}
				/>
			)}

			<CategoryDetailModal
				category={viewingCategory}
				isOpen={!!viewingCategory}
				onClose={() => setViewingCategory(null)}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</div>
	);
}
