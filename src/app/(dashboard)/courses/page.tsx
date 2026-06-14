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
import { CourseFilters } from "./_components/CourseFilters";
import { CourseCard } from "./_components/CourseCard";

export default function CoursesPage() {
	const { data, isLoading, isError } = useCourses();
	const deleteCourse = useDeleteCourse();

	useEnrollmentStats();
	const enrolledCountMap = useDataStore((s) => s.enrolledCountMap);

	// Filtros locales
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [typeFilter, setTypeFilter] = useState("all");

	// Filtrado de la data
	const filteredData = useMemo(() => {
		if (!data) return [];
		return data.filter((course) => {
			// Búsqueda
			const matchesSearch = course.title
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
			
			// Estado
			const matchesStatus =
				statusFilter === "all" ||
				(statusFilter === "published" && course.is_published) ||
				(statusFilter === "draft" && !course.is_published);
			
			// Tipo
			const matchesType =
				typeFilter === "all" ||
				(typeFilter === "free" && course.course_type === "FREE") ||
				(typeFilter === "paid" && course.course_type === "PAID");

			return matchesSearch && matchesStatus && matchesType;
		});
	}, [data, searchQuery, statusFilter, typeFilter]);

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
							searchPlaceholder="Buscar en resultados..."
							hideSearch // Si tu DataTable permite ocultar la búsqueda interna, sino la dejamos
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
