"use client";

import { X } from "lucide-react";
import { CategoryForm } from "../forms/CategoryForm";
import { type CategoryResponse } from "@/features/categories/schemas/category.schema";

interface CategoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	category?: CategoryResponse;
}

export function CategoryModal({
	isOpen,
	onClose,
	category,
}: CategoryModalProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-lg rounded-xl bg-background shadow-lg border">
				<div className="flex items-center justify-between border-b p-4">
					<h3 className="text-lg font-semibold">
						{category ? "Editar Categoría" : "Nueva Categoría"}
					</h3>
					<button
						onClick={onClose}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors">
						<X className="h-4 w-4" />
					</button>
				</div>
				<div className="p-4">
					<CategoryForm
						initialData={category}
						onSuccess={onClose}
						onCancel={onClose}
					/>
				</div>
			</div>
		</div>
	);
}
