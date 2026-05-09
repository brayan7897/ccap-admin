"use client";

import { Search } from "lucide-react";
import type { NotificationType } from "@/types";

const TYPE_OPTIONS: { value: NotificationType | "ALL"; label: string }[] = [
	{ value: "ALL", label: "Todos los tipos" },
	{ value: "SYSTEM", label: "Sistema" },
	{ value: "COURSE_UPDATE", label: "Actualización de curso" },
	{ value: "ACHIEVEMENT", label: "Logro" },
	{ value: "PROMOTION", label: "Promoción" },
	{ value: "REMINDER", label: "Recordatorio" },
];

interface NotificationFiltersProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	typeFilter: NotificationType | "ALL";
	onTypeChange: (value: NotificationType | "ALL") => void;
}

export function NotificationFilters({
	searchQuery,
	onSearchChange,
	typeFilter,
	onTypeChange,
}: NotificationFiltersProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6 bg-card p-4 rounded-xl border border-border">
			{/* Buscador */}
			<div className="relative w-full sm:max-w-xs">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<input
					type="text"
					placeholder="Buscar por título o mensaje..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
				/>
			</div>

			{/* Filtros */}
			<div className="flex flex-wrap items-center gap-2">
				<select
					value={typeFilter}
					onChange={(e) => onTypeChange(e.target.value as NotificationType | "ALL")}
					className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
				>
					{TYPE_OPTIONS.map((o) => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
