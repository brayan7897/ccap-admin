"use client";

import { Search } from "lucide-react";
import type { EnrollmentStatus } from "@/types";

const STATUS_OPTIONS: { value: EnrollmentStatus | "ALL"; label: string }[] = [
	{ value: "ALL", label: "Todos los estados" },
	{ value: "ENROLLED", label: "Matriculado" },
	{ value: "ACTIVE", label: "Activo" },
	{ value: "COMPLETED", label: "Completado" },
	{ value: "CANCELLED", label: "Cancelado" },
];

interface EnrollmentFiltersProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	statusFilter: EnrollmentStatus | "ALL";
	onStatusChange: (value: EnrollmentStatus | "ALL") => void;
}

export function EnrollmentFilters({
	searchQuery,
	onSearchChange,
	statusFilter,
	onStatusChange,
}: EnrollmentFiltersProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 bg-card p-4 rounded-xl border border-border">
			{/* Buscador */}
			<div className="relative w-full sm:max-w-xs">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<input
					type="text"
					placeholder="Buscar matrícula..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
				/>
			</div>

			{/* Filtros */}
			<div className="flex flex-wrap items-center gap-2">
				<select
					value={statusFilter}
					onChange={(e) => onStatusChange(e.target.value as EnrollmentStatus | "ALL")}
					className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
				>
					{STATUS_OPTIONS.map((o) => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
