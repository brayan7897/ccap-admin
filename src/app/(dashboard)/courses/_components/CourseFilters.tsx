"use client";

import { FilterX } from "lucide-react";
import { SearchInput } from "@/components/shared/SearchInput";
import type { CourseStatus, CourseType } from "@/types";

interface CourseFiltersProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	isSearchPending?: boolean;
	statusFilter: CourseStatus | "all";
	onStatusChange: (value: CourseStatus | "all") => void;
	typeFilter: CourseType | "all";
	onTypeChange: (value: CourseType | "all") => void;
	onClear: () => void;
}

const selectClasses =
	"h-10 cursor-pointer rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CourseFilters({
	searchQuery,
	onSearchChange,
	isSearchPending = false,
	statusFilter,
	onStatusChange,
	typeFilter,
	onTypeChange,
	onClear,
}: CourseFiltersProps) {
	const hasFilters =
		searchQuery.trim() !== "" || statusFilter !== "all" || typeFilter !== "all";

	return (
		<div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
			<SearchInput
				className="sm:max-w-md"
				label="Buscar cursos"
				placeholder="Buscar por título o descripción…"
				value={searchQuery}
				onChange={onSearchChange}
				isPending={isSearchPending}
			/>

			<div className="flex flex-wrap items-center gap-2">
				<label className="sr-only" htmlFor="course-status-filter">
					Filtrar por estado
				</label>
				<select
					id="course-status-filter"
					value={statusFilter}
					onChange={(e) => onStatusChange(e.target.value as CourseStatus | "all")}
					className={selectClasses}>
					<option value="all">Todos los estados</option>
					<option value="published">Publicado</option>
					<option value="draft">Borrador</option>
					<option value="archived">Archivado</option>
				</select>

				<label className="sr-only" htmlFor="course-type-filter">
					Filtrar por tipo
				</label>
				<select
					id="course-type-filter"
					value={typeFilter}
					onChange={(e) => onTypeChange(e.target.value as CourseType | "all")}
					className={selectClasses}>
					<option value="all">Todos los tipos</option>
					<option value="FREE">Gratis</option>
					<option value="PAID">Pago</option>
				</select>

				{hasFilters && (
					<button
						type="button"
						onClick={onClear}
						className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
						<FilterX aria-hidden="true" className="h-4 w-4" />
						Limpiar
					</button>
				)}
			</div>
		</div>
	);
}
