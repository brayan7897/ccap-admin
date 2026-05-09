"use client";

import { Search } from "lucide-react";

interface RoleFiltersProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
}

export function RoleFilters({
	searchQuery,
	onSearchChange,
}: RoleFiltersProps) {
	return (
		<div className="mb-6 bg-card p-4 rounded-xl border border-border">
			<div className="relative w-full sm:max-w-md">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<input
					type="text"
					placeholder="Buscar roles por nombre..."
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
				/>
			</div>
		</div>
	);
}
