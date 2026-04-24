"use client";

import { DataTable } from "@/components/tables/DataTable";
import { buildCoursesColumns } from "@/components/tables/columns/courses-columns";
import {
	useCourses,
	useDeleteCourse,
} from "@/features/courses/hooks/useCourses";
import { useEnrollments } from "@/features/enrollments/hooks/useEnrollments";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function CoursesPage() {
	const { data, isLoading, isError } = useCourses();
	const deleteCourse = useDeleteCourse();
	// useEnrollments shares React Query cache with the Matrículas panel
	// (same key ["enrollments", {skip:0, limit:50}]) — no duplicate request.
	const { data: enrollments } = useEnrollments(0, 50);

	// Build a per-course enrollment count map as fallback when the API
	// doesn't return enrolled_count directly on each course object.
	const enrolledCountMap = useMemo<Record<string, number>>(
		() =>
			(enrollments ?? []).reduce<Record<string, number>>((acc, e) => {
				acc[e.course_id] = (acc[e.course_id] ?? 0) + 1;
				return acc;
			}, {}),
		[enrollments],
	);

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
				<p className="text-sm text-muted-foreground">Cargando cursos…</p>
			)}
			{isError && (
				<p className="text-sm text-destructive">
					Error al cargar los cursos. Verifica que la API esté disponible.
				</p>
			)}

			{/* Table */}
			{!isLoading && (
				<DataTable
					columns={columns}
					data={data ?? []}
					searchPlaceholder="Buscar cursos…"
				/>
			)}
		</div>
	);
}
