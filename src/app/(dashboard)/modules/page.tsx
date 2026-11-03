"use client";

import { DataTable } from "@/components/tables/DataTable";
import { TableError } from "@/components/tables/TableStates";
import { TableSkeleton } from "@/components/ui/skeleton";
import { buildModulesColumns } from "@/components/tables/columns/modules-columns";
import { useDeleteModule, useModules } from "@/features/modules/hooks/useModules";
import { useCourse } from "@/features/courses/hooks/useCourses";
import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ModulesContent() {
	const searchParams = useSearchParams();
	const courseId = searchParams.get("courseId") ?? "";

	const { data, isLoading, isError, isFetching, refetch } = useModules(courseId);
	const { data: course } = useCourse(courseId);
	const deleteModule = useDeleteModule(courseId);

	const columns = useMemo(
		() => buildModulesColumns((id) => deleteModule.mutate(id)),
		[deleteModule],
	);

	if (!courseId) {
		return (
			<p className="text-sm text-muted-foreground">
				Selecciona un curso para ver sus módulos.
			</p>
		);
	}

	return (
		<div className="space-y-4">
			{/* Which course these modules belong to — by name, never by id */}
			{course && (
				<p className="text-sm text-muted-foreground">
					Curso:{" "}
					<span className="font-medium text-foreground">
						{course.title}
					</span>
				</p>
			)}

			{isLoading && (
				<div className="rounded-xl border border-border bg-card p-4">
					<TableSkeleton rows={5} columns={3} />
				</div>
			)}
			{isError && (
				<TableError
					message="No se pudieron cargar los módulos."
					onRetry={() => refetch()}
					isRetrying={isFetching}
				/>
			)}
			{!isLoading && !isError && (
				<DataTable
					columns={columns}
					data={data ?? []}
					ariaLabel="Módulos del curso"
					searchPlaceholder="Buscar módulos…"
				/>
			)}
		</div>
	);
}

export default function ModulesPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-foreground">Módulos</h2>
				<p className="text-sm text-muted-foreground">
					Administra los módulos de los cursos.
				</p>
			</div>
			<Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
				<ModulesContent />
			</Suspense>
		</div>
	);
}
