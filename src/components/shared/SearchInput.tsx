"use client";

import { Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	/** Accessible name; the placeholder alone is not a label. */
	label: string;
	/** Shows a spinner while a debounced search is pending. */
	isPending?: boolean;
	className?: string;
}

export function SearchInput({
	value,
	onChange,
	placeholder,
	label,
	isPending = false,
	className,
}: SearchInputProps) {
	return (
		<div className={cn("relative w-full", className)}>
			<Search
				aria-hidden="true"
				className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
			/>
			<input
				type="search"
				inputMode="search"
				autoComplete="off"
				aria-label={label}
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-search-cancel-button]:hidden"
			/>
			{isPending ? (
				<Loader2
					aria-hidden="true"
					className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground motion-reduce:animate-none"
				/>
			) : (
				value && (
					<button
						type="button"
						onClick={() => onChange("")}
						aria-label="Limpiar búsqueda"
						className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
						<X className="h-4 w-4" />
					</button>
				)
			)}
		</div>
	);
}
