"use client";

import { DataTable } from "@/components/tables/DataTable";
import { MobilePager } from "@/components/tables/MobilePager";
import { TableEmpty, TableError } from "@/components/tables/TableStates";
import { TableSkeleton } from "@/components/ui/skeleton";
import { buildCoursesColumns } from "@/components/tables/columns/courses-columns";
import {
	useCoursesList,
	useDeleteCourse,
} from "@/features/courses/hooks/useCourses";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useServerTable } from "@/hooks/useServerTable";
import { type SortingState } from "@tanstack/react-table";
import type { CourseStatus, CourseType } from "@/types";
import { CourseFilters } from "./_components/CourseFilters";
import { CourseCard } from "./_components/CourseCard";

const PAGE_SIZES = [10, 25, 50, 100];

export default function CoursesPage() {
	const deleteCourse = useDeleteCourse();

	// Search, status/type filters, sorting and pagination all run on the
	// server, so the filters apply to the whole catalog (not just the 50 rows
	// that happen to be loaded) and the footer shows the true total.
	const table = useServerTable({ pageSize: 25 });
	const [statusFilter, setStatusFilter] = useState<CourseStatus | "all">("all");
	const [typeFilter, setTypeFilter] = useState<CourseType | "all">("all");
	const [sorting, setSorting] = useState<SortingState>([]);

	const sort_by = sorting.length > 0 ? sorting[0].id : undefined;
	const sort_order = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined;

	const { data, isLoading, isError, isFetching, refetch } = useCoursesList({
		skip: table.skip,
		limit: table.limit,
		q: table.search || undefined,
		status: statusFilter === "all" ? undefined : statusFilter,
		course_type: typeFilter === "all" ? undefined : typeFilter,
		sort_by,
		sort_order,
	});

	const items = data?.items ?? [];
	const hasFilters =
		table.searchInput.trim() !== "" || statusFilter !== "all" || typeFilter !== "all";

	const columns = useMemo(
		() => buildCoursesColumns((id) => deleteCourse.mutate(id)),
		[deleteCourse],
	);

	function handleStatusChange(next: CourseStatus | "all") {
		setStatusFilter(next);
		table.resetPage();
	}

	function handleTypeChange(next: CourseType | "all") {
		setTypeFilter(next);
		table.resetPage();
	}

	function clearFilters() {
		table.setSearchInput("");
		setStatusFilter("all");
		setTypeFilter("all");
		table.resetPage();
	}

	const emptyState = (
		<TableEmpty
			entity="cursos"
			hasFilters={hasFilters}
			onClearFilters={clearFilters}
			action={
				<Link
					href="/courses/new"
					className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
					Crear el primer curso
				</Link>
			}
		/>
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-xl font-semibold text-foreground">Cursos</h2>
					<p className="text-sm text-muted-foreground">
						Gestiona el catálogo de cursos de la plataforma.
					</p>
				</div>
				<Link
					href="/courses/new"
					className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
					<Plus aria-hidden="true" className="h-4 w-4" />
					Nuevo curso
				</Link>
			</div>

			<CourseFilters
				searchQuery={table.searchInput}
				onSearchChange={table.setSearchInput}
				isSearchPending={table.isSearchPending}
				statusFilter={statusFilter}
				onStatusChange={handleStatusChange}
				typeFilter={typeFilter}
				onTypeChange={handleTypeChange}
				onClear={clearFilters}
			/>

			{isLoading && (
				<div className="rounded-xl border border-border bg-card p-4">
					<TableSkeleton rows={8} columns={5} />
				</div>
			)}

			{isError && !data && (
				<TableError
					message="No se pudieron cargar los cursos."
					onRetry={() => refetch()}
					isRetrying={isFetching}
				/>
			)}

			{data && (
				<>
					{/* Desktop table (hidden on small screens) */}
					<div className="hidden md:block">
						<DataTable
							columns={columns}
							data={items}
							ariaLabel="Cursos"
							hideSearch
							manualPagination
							pagination={table.pagination}
							onPaginationChange={table.setPagination}
							pageSizeOptions={PAGE_SIZES}
							totalRecords={data.total}
							rowCount={items.length}
							isFetching={isFetching}
							emptyState={emptyState}
							manualSorting
							sorting={sorting}
							onSortingChange={(updater: SortingState | ((old: SortingState) => SortingState)) => {
								setSorting(updater);
								table.resetPage();
							}}
						/>
					</div>

					{/* Mobile/tablet cards (hidden on md and larger) */}
					<div className="md:hidden">
						{items.length > 0 ? (
							<div
								aria-busy={isFetching}
								className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 motion-reduce:transition-none ${isFetching ? "opacity-70" : ""}`}>
								{items.map((course) => (
									<CourseCard
										key={course.id}
										course={course}
										enrolledCount={course.enrolled_count ?? 0}
										onDelete={deleteCourse.mutate}
									/>
								))}
							</div>
						) : (
							<div className="rounded-xl border border-border bg-card">{emptyState}</div>
						)}
						<MobilePager
							pageIndex={table.pagination.pageIndex}
							pageSize={table.pagination.pageSize}
							total={data.total}
							onChange={(pageIndex) =>
								table.setPagination((p) => ({ ...p, pageIndex }))
							}
						/>
					</div>
				</>
			)}
		</div>
	);
}
