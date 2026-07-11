"use client";

import { DataTable } from "@/components/tables/DataTable";
import { TableSkeleton } from "@/components/ui/skeleton";
import { buildCoursesColumns } from "@/components/tables/columns/courses-columns";
import {
	useCourses,
	useDeleteCourse,
} from "@/features/courses/hooks/useCourses";
import { useEnrollmentStats } from "@/features/enrollments/hooks/useEnrollments";
import { useDataStore } from "@/store/data-store";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { type SortingState } from "@tanstack/react-table";
import { CourseFilters } from "./_components/CourseFilters";
import { CourseCard } from "./_components/CourseCard";

export default function CoursesPage() {
	const deleteCourse = useDeleteCourse();

	// Filtros locales
	const [searchQuery, setSearchQuery] = useState("");
	const validSearchQuery = searchQuery.length >= 3 ? searchQuery : "";
	const debouncedSearchQuery = useDebounce(validSearchQuery, 400);
	const [statusFilter, setStatusFilter] = useState("all");
	const [typeFilter, setTypeFilter] = useState("all");

	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
	const [sorting, setSorting] = useState<SortingState>([]);

	const sort_by = sorting.length > 0 ? sorting[0].id : undefined;
	const sort_order = sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : undefined;

	const { data, isLoading, isError } = useCourses(
		pagination.pageIndex * pagination.pageSize,
		pagination.pageSize,
		debouncedSearchQuery,
		sort_by,
		sort_order
	);

	useEnrollmentStats();
	// Use a stable selector — re-renders ONLY when the map reference actually changes,
	// not on every unrelated store update. (rule: rerender-derived-state)
	const enrolledCountMap = useDataStore((s) => s.enrolledCountMap);



	// Filtrado de la data
	const filteredData = useMemo(() => {
		if (!data) return [];
		return data.filter((course) => {
			// Estado
			const matchesStatus =
				statusFilter === "all" || course.status === statusFilter;

			// Tipo
			const matchesType =
				typeFilter === "all" ||
				(typeFilter === "free" && course.course_type === "FREE") ||
				(typeFilter === "paid" && course.course_type === "PAID");

			return matchesStatus && matchesType;
		});
	}, [data, statusFilter, typeFilter]);

	const columns = useMemo(
		() =>
			buildCoursesColumns((id) => deleteCourse.mutate(id), enrolledCountMap),
		[deleteCourse, enrolledCountMap],
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-foreground">Cursos</h2>
					<p className="text-sm text-muted-foreground">
						Gestiona el catálogo de cursos de la plataforma.
					</p>
				</div>
				<Link
					href="/courses/new"
					className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
					<Plus className="h-4 w-4" />
					Nuevo curso
				</Link>
			</div>

			{/* States */}
			{isLoading && (
				<div className="rounded-xl border border-border bg-card p-4">
					<TableSkeleton rows={6} columns={5} />
				</div>
			)}
			{isError && (
				<p className="text-sm text-destructive">
					Error al cargar los cursos. Verifica que la API esté disponible.
				</p>
			)}

			{!isLoading && !isError && (
				<>
					{/* Filtros */}
					<CourseFilters
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						statusFilter={statusFilter}
						onStatusChange={setStatusFilter}
						typeFilter={typeFilter}
						onTypeChange={setTypeFilter}
					/>

					{/* Desktop Table (Hidden on small screens) */}
					<div className="hidden md:block">
						<DataTable
							columns={columns}
							data={filteredData}
							rowCount={data?.length ?? 0}
							searchPlaceholder="Buscar cursos..."
							hideSearch
							manualPagination
							pagination={pagination}
							onPaginationChange={setPagination}
							manualSorting
							sorting={sorting}
							onSortingChange={setSorting}
						/>
					</div>

					{/* Mobile/Tablet Cards (Hidden on md and larger) */}
					<div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
						{filteredData.length > 0 ? (
							filteredData.map((course) => (
								<CourseCard
									key={course.id}
									course={course}
									enrolledCount={
										course.enrolled_count ?? enrolledCountMap[course.id] ?? 0
									}
									onDelete={deleteCourse.mutate}
								/>
							))
						) : (
							<div className="col-span-full py-8 text-center text-sm text-muted-foreground bg-card border border-border rounded-xl">
								No se encontraron cursos que coincidan con los filtros.
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}
