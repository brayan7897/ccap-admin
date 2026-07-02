"use client";

import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
	columns: ColumnDef<TData, unknown>[];
	data: TData[];
	searchPlaceholder?: string;
	searchColumn?: string;
	extraFilters?: React.ReactNode;
	hideSearch?: boolean;
	onRowClick?: (row: TData) => void;

	// Server-side props
	manualPagination?: boolean;
	pageCount?: number;
	pagination?: { pageIndex: number; pageSize: number };
	onPaginationChange?: (pagination: any) => void;
	
	manualSorting?: boolean;
	sorting?: SortingState;
	onSortingChange?: (sorting: any) => void;
	
	globalFilter?: string;
	onGlobalFilterChange?: (filter: string) => void;
	totalRecords?: number;
	rowCount?: number;
}

export function DataTable<TData>({
	columns,
	data = [],
	searchPlaceholder = "Buscar…",
	searchColumn,
	extraFilters,
	hideSearch = false,
	onRowClick,
	manualPagination = false,
	pageCount,
	pagination,
	onPaginationChange,
	manualSorting = false,
	sorting: controlledSorting,
	onSortingChange,
	globalFilter: controlledGlobalFilter,
	onGlobalFilterChange,
	totalRecords,
	rowCount,
}: DataTableProps<TData>) {
	const [internalGlobalFilter, setInternalGlobalFilter] = useState("");
	const [internalSorting, setInternalSorting] = useState<SortingState>([]);

	const globalFilter = controlledGlobalFilter !== undefined ? controlledGlobalFilter : internalGlobalFilter;
	const sorting = controlledSorting !== undefined ? controlledSorting : internalSorting;

	const handleGlobalFilterChange = (val: string) => {
		setInternalGlobalFilter(val);
		onGlobalFilterChange?.(val);
	};

	const table = useReactTable({
		data,
		columns,
		state: { 
			globalFilter, 
			sorting,
			...(pagination ? { pagination } : {}),
		},
		onGlobalFilterChange: setInternalGlobalFilter, // We handle it manually via input
		onSortingChange: onSortingChange ?? setInternalSorting,
		onPaginationChange: onPaginationChange,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: manualPagination ? undefined : getFilteredRowModel(),
		getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),
		getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
		manualPagination,
		manualSorting,
		pageCount: pageCount !== undefined 
			? pageCount 
			: manualPagination
				? (((rowCount ?? data.length) === (pagination?.pageSize ?? 10)) ? -1 : (pagination?.pageIndex ?? 0) + 1)
				: undefined,
		initialState: pagination ? undefined : { pagination: { pageSize: 10 } },
	});

	void searchColumn;

	return (
		<div className="space-y-4">
			{/* Search + extra filters */}
			{(!hideSearch || extraFilters) && (
				<div className="flex flex-wrap items-center gap-3">
					{!hideSearch && (
						<div className="relative max-w-sm flex-1 min-w-50">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<input
								value={globalFilter}
								onChange={(e) => handleGlobalFilterChange(e.target.value)}
								placeholder={searchPlaceholder}
								className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							/>
						</div>
					)}
					{extraFilters}
				</div>
			)}

			{/* Table */}
			<div className="rounded-lg border border-border overflow-hidden bg-card">
				<table className="w-full text-sm">
					<thead className="bg-muted/50">
						{table.getHeaderGroups().map((hg) => (
							<tr key={hg.id}>
								{hg.headers.map((header) => {
									const canSort = header.column.getCanSort();
									const sorted = header.column.getIsSorted();
									return (
										<th
											key={header.id}
											onClick={
												canSort
													? header.column.getToggleSortingHandler()
													: undefined
											}
											className={cn(
												"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
												canSort &&
													"cursor-pointer select-none hover:text-foreground",
												(header.column.columnDef.meta as any)?.className
											)}>
											{header.isPlaceholder ? null : (
												<span className="inline-flex items-center gap-1">
													{flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
													{canSort &&
														(sorted === "asc" ? (
															<ChevronUp className="h-3 w-3 text-primary" />
														) : sorted === "desc" ? (
															<ChevronDown className="h-3 w-3 text-primary" />
														) : (
															<ChevronsUpDown className="h-3 w-3 opacity-40" />
														))}
												</span>
											)}
										</th>
									);
								})}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length}
									className="py-10 text-center text-muted-foreground">
									Sin resultados.
								</td>
							</tr>
						) : (
							table.getRowModel().rows.map((row, i) => (
								<tr
									key={row.id}
									onClick={() => onRowClick?.(row.original)}
									className={cn(
										"border-t border-border transition-colors hover:bg-muted/50",
										i % 2 === 0 ? "bg-background" : "bg-card",
										onRowClick && "cursor-pointer"
									)}>
									{row.getVisibleCells().map((cell) => (
										<td 
											key={cell.id} 
											className={cn("px-4 py-3", (cell.column.columnDef.meta as any)?.className)}
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between text-sm text-muted-foreground">
				<span>
					{totalRecords !== undefined ? totalRecords : table.getFilteredRowModel().rows.length} registro(s) en total
				</span>
				<div className="flex items-center gap-2">
					<button
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						className="rounded-md border border-border px-3 py-1 hover:bg-muted disabled:pointer-events-none disabled:opacity-40">
						Anterior
					</button>
					<span>
						Pág. {table.getState().pagination.pageIndex + 1} 
						{table.getPageCount() !== -1 && ` / ${table.getPageCount()}`}
					</span>
					<button
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						className="rounded-md border border-border px-3 py-1 hover:bg-muted disabled:pointer-events-none disabled:opacity-40">
						Siguiente
					</button>
				</div>
			</div>
		</div>
	);
}
