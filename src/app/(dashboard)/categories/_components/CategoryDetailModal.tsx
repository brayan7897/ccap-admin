"use client";

import type { CategoryResponse } from "@/features/categories/schemas/category.schema";
import { X, Pencil, Trash2, Folder } from "lucide-react";
import { Portal } from "@/components/shared/Portal";

interface CategoryDetailModalProps {
	category: CategoryResponse | null;
	isOpen: boolean;
	onClose: () => void;
	onEdit: (category: CategoryResponse) => void;
	onDelete: (id: string) => void;
}

export function CategoryDetailModal({
	category,
	isOpen,
	onClose,
	onEdit,
	onDelete,
}: CategoryDetailModalProps) {
	if (!isOpen || !category) return null;

	return (
		<Portal>
			<div
				className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0"
				onClick={(e) => {
					if (e.target === e.currentTarget) onClose();
				}}
			>
			<div className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30 shrink-0">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-md">
							<Folder className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-foreground leading-tight">
								{category.name}
							</h2>
							<p className="text-sm text-muted-foreground font-mono">/{category.slug}</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors self-start"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5 overflow-y-auto space-y-6">
					{category.image_url && (
						<div>
							<h3 className="text-sm font-medium text-foreground mb-2">Imagen</h3>
							<div className="relative h-48 w-full overflow-hidden rounded-md border bg-muted">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={category.image_url}
									alt={`Imagen de ${category.name}`}
									className="h-full w-full object-cover"
									onError={(e) => {
										(e.target as HTMLImageElement).src =
											"https://via.placeholder.com/400x200?text=Imagen+No+Disponible";
									}}
								/>
							</div>
						</div>
					)}
					<div>
						<h3 className="text-sm font-medium text-foreground mb-2">Descripción</h3>
						{category.description ? (
							<div className="rounded-lg border border-border bg-card p-4">
								<p className="text-sm text-foreground whitespace-pre-wrap">{category.description}</p>
							</div>
						) : (
							<div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center">
								<p className="text-sm text-muted-foreground italic">No hay descripción para esta categoría.</p>
							</div>
						)}
					</div>
				</div>

				{/* Footer Actions */}
				<div className="border-t border-border bg-muted/30 px-6 py-4 shrink-0 flex flex-wrap gap-2 justify-end">
					<button
						onClick={() => {
							onClose();
							onEdit(category);
						}}
						className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
					>
						<Pencil className="h-4 w-4" />
						Editar categoría
					</button>
					<button
						onClick={() => {
							onClose();
							onDelete(category.id);
						}}
						className="inline-flex items-center gap-2 rounded-md border border-destructive bg-transparent px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors ml-auto sm:ml-0"
					>
						<Trash2 className="h-4 w-4" />
						Eliminar
					</button>
				</div>
			</div>
			</div>
		</Portal>
	);
}
