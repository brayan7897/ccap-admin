"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import type { User } from "@/types";
import { useUsersSearch } from "@/hooks/useCatalog";
import { useUser } from "@/features/users/hooks/useUsers";

interface InstructorComboboxProps {
	value: string;
	onChange: (value: string) => void;
	instructors: User[];
	disabled?: boolean;
	placeholder?: string;
}

function isInstructorCandidate(u: User): boolean {
	const roleName = (u.role_name ?? u.role?.name ?? "").toLowerCase();
	return roleName.includes("instructor") || roleName.includes("admin");
}

/**
 * Instructor picker for CourseForm. Previously a bare native <select> fed by
 * `useUsers()` capped at the first 50 users, with no search at all — the most
 * severe instance of the "capped catalog, can't reach anyone past it" bug
 * found across the admin app, since a native <select> has no typeahead
 * fallback whatsoever. Mirrors UserCombobox's live-search fix.
 */
export function InstructorCombobox({
	value,
	onChange,
	instructors,
	disabled = false,
	placeholder = "Buscar instructor por nombre o email...",
}: InstructorComboboxProps) {
	const fieldClasses =
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-muted-foreground/30";

	const [search, setSearch] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [selectedCache, setSelectedCache] = useState<User | null>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const isLiveSearch = search.trim().length >= 3;
	const { results: searchResults } = useUsersSearch(search);
	// Same instructor/admin predicate applied to both the capped base list and
	// the live search results, so switching to search never changes who's eligible.
	const instructorSearchResults = useMemo(
		() => searchResults.filter(isInstructorCandidate),
		[searchResults]
	);

	const filteredInstructors = useMemo(() => {
		if (isLiveSearch) return instructorSearchResults;
		const q = search.toLowerCase().trim();
		if (!q) return instructors.slice(0, 50);
		return instructors
			.filter(
				(u) =>
					u.full_name?.toLowerCase().includes(q) ||
					`${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
					u.email?.toLowerCase().includes(q)
			)
			.slice(0, 50);
	}, [isLiveSearch, instructorSearchResults, search, instructors]);

	const localMatch =
		selectedCache?.id === value
			? selectedCache
			: (instructors.find((u) => u.id === value) ??
				instructorSearchResults.find((u) => u.id === value));

	// The `instructors` prop is a capped list (first 50 users) — an existing
	// course's assigned instructor may fall outside that cap, which used to
	// show a blank placeholder instead of their name. Fetch them directly by
	// id as a fallback so the combobox always displays who's actually assigned.
	const { data: fetchedInstructor } = useUser(!localMatch && value ? value : "");
	const selectedInstructor = localMatch ?? fetchedInstructor ?? undefined;

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="relative" ref={dropdownRef}>
			<button
				type="button"
				onClick={() => !disabled && setIsOpen(!isOpen)}
				disabled={disabled}
				className={`${fieldClasses} justify-between items-center text-left ${!selectedInstructor ? "text-muted-foreground" : ""}`}
			>
				{selectedInstructor ? (
					<span className="truncate">
						{selectedInstructor.full_name ||
							`${selectedInstructor.first_name} ${selectedInstructor.last_name}`}{" "}
						({selectedInstructor.email})
					</span>
				) : (
					<span className="truncate">{placeholder}</span>
				)}
				<ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
			</button>

			{isOpen && (
				<div className="absolute top-full z-50 mt-1.5 w-full rounded-lg border border-border bg-popover shadow-xl animate-in fade-in zoom-in-95">
					<div className="flex items-center border-b border-border px-3 py-2">
						<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
						<input
							type="text"
							className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground h-8"
							placeholder="Escribe nombre o email..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => {
								if (e.key === "Enter") e.preventDefault();
							}}
							autoFocus
						/>
					</div>
					<div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin">
						{filteredInstructors.length === 0 ? (
							<div className="p-3 text-center text-sm text-muted-foreground">
								No se encontraron instructores
							</div>
						) : (
							filteredInstructors.map((u) => (
								<button
									key={u.id}
									type="button"
									onClick={() => {
										onChange(u.id);
										setSelectedCache(u);
										setIsOpen(false);
										setSearch("");
									}}
									className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm text-left transition-colors hover:bg-accent hover:text-accent-foreground ${
										value === u.id ? "bg-primary/10 text-primary font-medium" : ""
									}`}
								>
									<div className="flex flex-col truncate pr-2">
										<span className="truncate font-medium text-foreground">
											{u.full_name || `${u.first_name} ${u.last_name}`}
										</span>
										<span className="text-xs text-muted-foreground truncate mt-0.5">
											{u.email}
										</span>
									</div>
									{value === u.id && <Check className="h-4 w-4 shrink-0" />}
								</button>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}
