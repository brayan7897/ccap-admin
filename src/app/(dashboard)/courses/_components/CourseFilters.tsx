"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseFiltersProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	statusFilter: string;
	onStatusChange: (value: string) => void;
	typeFilter: string;
	onTypeChange: (value: string) => void;
}

export function CourseFilters({
	searchQuery,
	onSearchChange,
	statusFilter,
	onStatusChange,
	typeFilter,
	onTypeChange,
}: CourseFiltersProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 bg-card p-4 rounded-xl border border-border">
			{/* Buscador */}
			<div className="relative w-full sm:max-w-xs">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<input
					type="text"
					placeholder="Buscar cursos..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
				/>
			</div>

			{/* Filtros */}
			<div className="flex flex-wrap items-center gap-2">
				<select
					value={statusFilter}
					onChange={(e) => onStatusChange(e.target.value)}
					className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
				>
					<option value="all">Todos los estados</option>
					<option value="published">Publicado</option>
					<option value="draft">Borrador</option>
					<option value="archived">Archivado</option>
				</select>

				<select
					value={typeFilter}
					onChange={(e) => onTypeChange(e.target.value)}
					className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
				>
					<option value="all">Todos los tipos</option>
					<option value="free">Gratis</option>
					<option value="paid">Pago</option>
				</select>
			</div>
		</div>
	);
}
