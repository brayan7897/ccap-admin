"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import type { User } from "@/types";

interface UserComboboxProps {
	value: string;
	onChange: (value: string) => void;
	users: User[];
	disabled?: boolean;
	placeholder?: string;
}

export function UserCombobox({
	value,
	onChange,
	users,
	disabled = false,
	placeholder = "Buscar estudiante por DNI o Nombre...",
}: UserComboboxProps) {
	const fieldClasses =
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-muted-foreground/30";

	const selectedUser = users.find((u) => u.id === value);
	const [userSearch, setUserSearch] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const filteredUsers = useMemo(() => {
		const q = userSearch.toLowerCase().trim();
		if (!q) return users.slice(0, 50); // Show max 50 initially
		return users
			.filter(
				(u) =>
					u.full_name?.toLowerCase().includes(q) ||
					u.first_name?.toLowerCase().includes(q) ||
					u.last_name?.toLowerCase().includes(q) ||
					u.document_number?.toLowerCase().includes(q) ||
					u.email?.toLowerCase().includes(q)
			)
			.slice(0, 50);
	}, [userSearch, users]);

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
				className={`${fieldClasses} justify-between items-center text-left ${!selectedUser ? "text-muted-foreground" : ""}`}
			>
				{selectedUser ? (
					<span className="truncate">
						<span className="font-semibold text-foreground mr-1.5">{selectedUser.document_number}</span>
						{selectedUser.full_name || `${selectedUser.first_name} ${selectedUser.last_name}`.trim()}
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
							placeholder="Escribe DNI o Nombre..."
							value={userSearch}
							onChange={(e) => setUserSearch(e.target.value)}
							onClick={(e) => e.stopPropagation()}
							autoFocus
						/>
					</div>
					<div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin">
						{filteredUsers.length === 0 ? (
							<div className="p-3 text-center text-sm text-muted-foreground">
								No se encontraron estudiantes
							</div>
						) : (
							filteredUsers.map((u) => (
								<button
									key={u.id}
									type="button"
									onClick={() => {
										onChange(u.id);
										setIsOpen(false);
										setUserSearch("");
									}}
									className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm text-left transition-colors hover:bg-accent hover:text-accent-foreground ${
										value === u.id ? "bg-primary/10 text-primary font-medium" : ""
									}`}
								>
									<div className="flex flex-col truncate pr-2">
										<span className="truncate font-medium text-foreground">
											{u.full_name || `${u.first_name} ${u.last_name}`.trim()}
										</span>
										<span className="text-xs text-muted-foreground truncate mt-0.5">
											DNI: {u.document_number} · {u.email}
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
