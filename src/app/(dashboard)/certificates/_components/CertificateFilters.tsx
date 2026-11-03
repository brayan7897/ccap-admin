"use client";

import { SearchInput } from "@/components/shared/SearchInput";

interface CertificateFiltersProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	isSearchPending?: boolean;
}

export function CertificateFilters({
	searchQuery,
	onSearchChange,
	isSearchPending = false,
}: CertificateFiltersProps) {
	return (
		<div className="rounded-xl border border-border bg-card p-4">
			<SearchInput
				className="sm:max-w-md"
				label="Buscar certificados"
				placeholder="Buscar por estudiante, DNI, curso o código…"
				value={searchQuery}
				onChange={onSearchChange}
				isPending={isSearchPending}
			/>
		</div>
	);
}
