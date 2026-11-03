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
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronUp,
	ChevronsUpDown,
	Search,
} from "lucide-react";
import { useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> {
	columns: ColumnDef<TData, unknown>[];
	data: TData[];
	searchPlaceholder?: string;
	searchColumn?: string;
	extraFilters?: ReactNode;
	hideSearch?: boolean;
	onRowClick?: (row: TData) => void;
	/** Accessible name of the table (read by screen readers). */
	ariaLabel?: string;
	/** Accessible name of a clickable row, e.g. "Ver detalle de Ana Pérez". */
	getRowAriaLabel?: (row: TData) => string;

	// Server-side props
	manualPagination?: boolean;
	pageCount?: number;
	pagination?: { pageIndex: number; pageSize: number };
	onPaginationChange?: (pagination: any) => void;
	/** Selectable page sizes. Omit to hide the selector. */
	pageSizeOptions?: number[];

	manualSorting?: boolean;
	sorting?: SortingState;
	onSortingChange?: (sorting: any) => void;

	globalFilter?: string;
	onGlobalFilterChange?: (filter: string) => void;
	/** Total rows matching the filters on the server (drives page count + footer). */
	totalRecords?: number;
	rowCount?: number;

	/** A background refetch / page change is in flight (keeps old rows visible). */
	isFetching?: boolean;
	/** Rendered instead of the plain "Sin resultados." row. */
	emptyState?: ReactNode;
}

/** Clicks on these inside a row must not trigger the row's own click handler. */
const INTERACTIVE = "button, a, input, select, textarea, label, [role='button'], [data-row-ignore]";

export function DataTable<TData>({
	columns,
	data = [],
	searchPlaceholder = "Buscar…",
	searchColumn,
	extraFilters,
	hideSearch = false,
	onRowClick,
	ariaLabel,
	getRowAriaLabel,
	manualPagination = false,
	pageCount,
	pagination,
	onPaginationChange,
	pageSizeOptions,
	manualSorting = false,
	sorting: controlledSorting,
	onSortingChange,
	globalFilter: controlledGlobalFilter,
	onGlobalFilterChange,
	totalRecords,
	rowCount,
	isFetching = false,
	emptyState,
}: DataTableProps<TData>) {
	const [internalGlobalFilter, setInternalGlobalFilter] = useState("");
	const [internalSorting, setInternalSorting] = useState<SortingState>([]);

	const globalFilter = controlledGlobalFilter !== undefined ? controlledGlobalFilter : internalGlobalFilter;
	const sorting = controlledSorting !== undefined ? controlledSorting : internalSorting;

	const handleGlobalFilterChange = (val: string) => {
		setInternalGlobalFilter(val);
		onGlobalFilterChange?.(val);
	};

	const pageSize = pagination?.pageSize ?? 10;

	// With a known server total we can show a real "Pág. X / N" and disable
	// "Siguiente" on the last page. Without it, fall back to the old heuristic.
	const resolvedPageCount =
		pageCount !== undefined
			? pageCount
			: manualPagination
				? totalRecords !== undefined
					? Math.max(1, Math.ceil(totalRecords / pageSize))
					: (rowCount ?? data.length) === pageSize
						? -1
						: (pagination?.pageIndex ?? 0) + 1
				: undefined;

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
		pageCount: resolvedPageCount,
		initialState: pagination ? undefined : { pagination: { pageSize: 10 } },
	});

	void searchColumn;

	const rows = table.getRowModel().rows;
	const pageIndex = table.getState().pagination.pageIndex;
	const total =
		totalRecords !== undefined ? totalRecords : table.getFilteredRowModel().rows.length;
	const from = rows.length === 0 ? 0 : pageIndex * table.getState().pagination.pageSize + 1;
	const to = from === 0 ? 0 : from + rows.length - 1;
	const pageCountKnown = table.getPageCount() !== -1;

	function handleRowClick(e: MouseEvent<HTMLTableRowElement>, row: TData) {
		if (!onRowClick) return;
		if ((e.target as HTMLElement).closest(INTERACTIVE)) return;
		onRowClick(row);
	}

	function handleRowKeyDown(e: KeyboardEvent<HTMLTableRowElement>, row: TData) {
		if (!onRowClick || e.target !== e.currentTarget) return;
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onRowClick(row);
		}
	}

	return (
		<div className="space-y-4">
			{/* Search + extra filters */}
			{(!hideSearch || extraFilters) && (
				<div className="flex flex-wrap items-center gap-3">
					{!hideSearch && (
						<div className="relative max-w-sm flex-1 min-w-50">
							<Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<input
								type="search"
								aria-label={searchPlaceholder}
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
			<div className="relative overflow-hidden rounded-lg border border-border bg-card">
				{/* Thin progress bar while a refetch is in flight (rows stay visible) */}
				{isFetching && (
					<div
						aria-hidden="true"
						className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-primary/15">
						<div className="h-full w-1/3 animate-[table-loading_1s_ease-in-out_infinite] bg-primary motion-reduce:animate-none" />
					</div>
				)}
				<div className="overflow-x-auto">
					<table
						aria-label={ariaLabel}
						aria-busy={isFetching}
						className={cn(
							"w-full text-sm transition-opacity duration-200 motion-reduce:transition-none",
							isFetching && "opacity-70",
						)}>
						<thead className="bg-muted/50">
							{table.getHeaderGroups().map((hg) => (
								<tr key={hg.id}>
									{hg.headers.map((header) => {
										const canSort = header.column.getCanSort();
										const sorted = header.column.getIsSorted();
										const label = header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext());
										return (
											<th
												key={header.id}
												scope="col"
												aria-sort={
													sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : canSort ? "none" : undefined
												}
												className={cn(
													"px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground",
													(header.column.columnDef.meta as any)?.className,
												)}>
												{header.isPlaceholder ? null : canSort ? (
													<button
														type="button"
														onClick={header.column.getToggleSortingHandler()}
														className="inline-flex cursor-pointer select-none items-center gap-1 rounded uppercase tracking-wider transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
														{label}
														{sorted === "asc" ? (
															<ChevronUp aria-hidden="true" className="h-3 w-3 text-primary" />
														) : sorted === "desc" ? (
															<ChevronDown aria-hidden="true" className="h-3 w-3 text-primary" />
														) : (
															<ChevronsUpDown aria-hidden="true" className="h-3 w-3 opacity-40" />
														)}
													</button>
												) : (
													label
												)}
											</th>
										);
									})}
								</tr>
							))}
						</thead>
						<tbody>
							{rows.length === 0 ? (
								<tr>
									<td colSpan={columns.length} className="p-0 text-center text-muted-foreground">
										{emptyState ?? <div className="py-10">Sin resultados.</div>}
									</td>
								</tr>
							) : (
								rows.map((row, i) => (
									<tr
										key={row.id}
										onClick={onRowClick ? (e) => handleRowClick(e, row.original) : undefined}
										onKeyDown={onRowClick ? (e) => handleRowKeyDown(e, row.original) : undefined}
										tabIndex={onRowClick ? 0 : undefined}
										aria-label={onRowClick ? getRowAriaLabel?.(row.original) : undefined}
										className={cn(
											"border-t border-border transition-colors hover:bg-muted/50",
											i % 2 === 0 ? "bg-background" : "bg-card",
											onRowClick &&
												"cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
										)}>
										{row.getVisibleCells().map((cell) => (
											<td
												key={cell.id}
												className={cn("px-4 py-3 align-middle", (cell.column.columnDef.meta as any)?.className)}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										))}
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Pagination */}
			<nav
				aria-label="Paginación"
				className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
				<span aria-live="polite" className="tabular-nums">
					{manualPagination && totalRecords !== undefined ? (
						total === 0 ? (
							"0 registros"
						) : (
							<>
								Mostrando{" "}
								<strong className="font-medium text-foreground">
									{from}–{to}
								</strong>{" "}
								de <strong className="font-medium text-foreground">{total}</strong>
							</>
						)
					) : (
						`${total} registro(s) en total`
					)}
				</span>
				<div className="flex flex-wrap items-center gap-3">
					{pageSizeOptions && pageSizeOptions.length > 1 && (
						<label className="flex items-center gap-2">
							<span className="hidden sm:inline">Filas</span>
							<select
								value={pageSize}
								onChange={(e) =>
									onPaginationChange?.({ pageIndex: 0, pageSize: Number(e.target.value) })
								}
								className="h-9 cursor-pointer rounded-md border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
								{pageSizeOptions.map((n) => (
									<option key={n} value={n}>
										{n}
									</option>
								))}
							</select>
						</label>
					)}
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							aria-label="Página anterior"
							className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-md border border-border px-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40">
							<ChevronLeft aria-hidden="true" className="h-4 w-4" />
							<span className="hidden sm:inline">Anterior</span>
						</button>
						<span className="min-w-16 text-center tabular-nums">
							Pág. {pageIndex + 1}
							{pageCountKnown && ` / ${table.getPageCount()}`}
						</span>
						<button
							type="button"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							aria-label="Página siguiente"
							className="inline-flex h-9 cursor-pointer items-center gap-1 rounded-md border border-border px-3 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40">
							<span className="hidden sm:inline">Siguiente</span>
							<ChevronRight aria-hidden="true" className="h-4 w-4" />
						</button>
					</div>
				</div>
			</nav>
		</div>
	);
}
