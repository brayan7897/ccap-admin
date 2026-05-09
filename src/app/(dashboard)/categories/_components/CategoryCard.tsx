"use client";

import type { CategoryResponse } from "@/features/categories/schemas/category.schema";
import { Folder } from "lucide-react";

interface CategoryCardProps {
	category: CategoryResponse;
	onClick: () => void;
}

export function CategoryCard({ category, onClick }: CategoryCardProps) {
	return (
		<div
			onClick={onClick}
			className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
		>
			<div className="p-4 flex-1">
				<div className="flex items-center gap-2 mb-2">
					<Folder className="h-4 w-4 text-primary" />
					<h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-1">
						{category.name}
					</h3>
				</div>
				<p className="text-xs text-muted-foreground font-mono mb-2">
					/{category.slug}
				</p>
				{category.description ? (
					<p className="text-xs text-muted-foreground line-clamp-2 mt-2 border-t border-border pt-2">
						{category.description}
					</p>
				) : (
					<p className="text-xs text-muted-foreground/50 italic mt-2 border-t border-border pt-2">
						Sin descripción
					</p>
				)}
			</div>
			<div className="border-t border-border bg-muted/20 px-4 py-2 text-center">
				<span className="text-xs font-medium text-primary">Ver detalles</span>
			</div>
		</div>
	);
}
