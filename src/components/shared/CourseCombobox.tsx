"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import type { Course } from "@/types";

interface CourseComboboxProps {
	value: string;
	onChange: (value: string) => void;
	courses: Course[];
	disabled?: boolean;
	placeholder?: string;
}

export function CourseCombobox({
	value,
	onChange,
	courses,
	disabled = false,
	placeholder = "Buscar curso por nombre...",
}: CourseComboboxProps) {
	const fieldClasses =
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-muted-foreground/30";

	const selectedCourse = courses.find((c) => c.id === value);
	const [search, setSearch] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const filteredCourses = useMemo(() => {
		const q = search.toLowerCase().trim();
		if (!q) return courses.slice(0, 50); // Show max 50 initially
		return courses
			.filter(
				(c) =>
					c.title?.toLowerCase().includes(q) ||
					c.slug?.toLowerCase().includes(q)
			)
			.slice(0, 50);
	}, [search, courses]);

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
					<span className="truncate">
						{selectedCourse.title}
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
										setIsOpen(false);
										setSearch("");
									}}
									className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm text-left transition-colors hover:bg-accent hover:text-accent-foreground ${
										value === c.id ? "bg-primary/10 text-primary font-medium" : ""
									}`}
								>
									<div className="flex flex-col truncate pr-2">
										<span className="truncate font-medium text-foreground">
											{c.title} {c.course_type === "PAID" ? "(Pago)" : "(Gratis)"}
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
