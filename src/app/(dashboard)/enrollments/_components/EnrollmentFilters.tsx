"use client";

import { FilterX } from "lucide-react";
import { SearchInput } from "@/components/shared/SearchInput";
import type { EnrollmentStatus } from "@/types";

export const ENROLLMENT_STATUS_OPTIONS: { value: EnrollmentStatus | "ALL"; label: string }[] = [
	{ value: "ALL", label: "Todos los estados" },
	{ value: "ENROLLED", label: "Matriculado" },
	{ value: "ACTIVE", label: "Activo" },
	{ value: "COMPLETED", label: "Completado" },
	{ value: "CANCELLED", label: "Cancelado" },
];

interface EnrollmentFiltersProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	isSearchPending?: boolean;
	statusFilter: EnrollmentStatus | "ALL";
	onStatusChange: (value: EnrollmentStatus | "ALL") => void;
	onClear: () => void;
}

export function EnrollmentFilters({
	searchQuery,
	onSearchChange,
	isSearchPending = false,
	statusFilter,
	onStatusChange,
	onClear,
}: EnrollmentFiltersProps) {
	const hasFilters = searchQuery.trim() !== "" || statusFilter !== "ALL";

	return (
		<div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
			<SearchInput
				className="sm:max-w-md"
				label="Buscar matrículas"
				placeholder="Buscar por estudiante, DNI, correo o curso…"
				value={searchQuery}
				onChange={onSearchChange}
				isPending={isSearchPending}
			/>

			<div className="flex flex-wrap items-center gap-2">
				<label className="sr-only" htmlFor="enrollment-status-filter">
					Filtrar por estado
				</label>
				<select
					id="enrollment-status-filter"
					value={statusFilter}
					onChange={(e) => onStatusChange(e.target.value as EnrollmentStatus | "ALL")}
					className="h-10 cursor-pointer rounded-md border border-input bg-background px-3 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
					{ENROLLMENT_STATUS_OPTIONS.map((o) => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
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
