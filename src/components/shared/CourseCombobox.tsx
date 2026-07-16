"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import type { Course } from "@/types";
import { useCoursesSearch } from "@/hooks/useCatalog";

interface CourseComboboxProps {
	value: string;
	onChange: (value: string) => void;
	courses: Course[];
	disabled?: boolean;
	placeholder?: string;
}

const STATUS_LABEL: Record<string, string> = {
	draft: "Borrador",
	archived: "Archivado",
};

export function CourseCombobox({
	value,
	onChange,
	courses,
	disabled = false,
	placeholder = "Buscar curso por nombre...",
}: CourseComboboxProps) {
	const fieldClasses =
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-muted-foreground/30";

	const [search, setSearch] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	// Caches the picked Course so the closed combobox keeps showing it even if
	// it came from a live search result outside the `courses` prop, or the
	// search text changes/clears afterward.
	const [selectedCourseCache, setSelectedCourseCache] = useState<Course | null>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Below 3 characters we filter the (max 50) `courses` prop client-side, same
	// as before. At 3+ characters we switch to a live server search so courses
	// beyond that initial cap — or created after it loaded — are still reachable.
	const isLiveSearch = search.trim().length >= 3;
	const { results: searchResults } = useCoursesSearch(search);

	const filteredCourses = useMemo(() => {
		if (isLiveSearch) return searchResults;
		const q = search.toLowerCase().trim();
		if (!q) return courses.slice(0, 50); // Show max 50 initially
		return courses
			.filter(
				(c) =>
					c.title?.toLowerCase().includes(q) ||
					c.slug?.toLowerCase().includes(q)
			)
			.slice(0, 50);
	}, [isLiveSearch, searchResults, search, courses]);

	const selectedCourse =
		selectedCourseCache?.id === value
			? selectedCourseCache
			: (courses.find((c) => c.id === value) ?? searchResults.find((c) => c.id === value));

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
				className={`${fieldClasses} justify-between items-center text-left ${!selectedCourse ? "text-muted-foreground" : ""}`}
			>
				{selectedCourse ? (
					<span className="truncate flex items-center gap-1.5">
						{selectedCourse.title}
						{STATUS_LABEL[selectedCourse.status] && (
							<span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
								{STATUS_LABEL[selectedCourse.status]}
							</span>
						)}
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
							placeholder="Escribe el nombre del curso..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onClick={(e) => e.stopPropagation()}
							onKeyDown={(e) => {
								// This input sits inside the surrounding <form> — Enter would
								// otherwise submit the form before a result is picked.
								if (e.key === "Enter") e.preventDefault();
							}}
							autoFocus
						/>
					</div>
					<div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin">
						{filteredCourses.length === 0 ? (
							<div className="p-3 text-center text-sm text-muted-foreground">
								No se encontraron cursos
							</div>
						) : (
							filteredCourses.map((c) => (
								<button
									key={c.id}
									type="button"
									onClick={() => {
										onChange(c.id);
										setSelectedCourseCache(c);
										setIsOpen(false);
										setSearch("");
									}}
									className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm text-left transition-colors hover:bg-accent hover:text-accent-foreground ${
										value === c.id ? "bg-primary/10 text-primary font-medium" : ""
									}`}
								>
									<div className="flex flex-col truncate pr-2">
										<span className="truncate font-medium text-foreground flex items-center gap-1.5">
											{c.title} {c.course_type === "PAID" ? "(Pago)" : "(Gratis)"}
											{STATUS_LABEL[c.status] && (
												<span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
													{STATUS_LABEL[c.status]}
												</span>
											)}
										</span>
									</div>
									{value === c.id && <Check className="h-4 w-4 shrink-0" />}
								</button>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}
