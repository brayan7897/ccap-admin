"use client";

import { DataTable } from "@/components/tables/DataTable";
import { buildLessonsColumns } from "@/components/tables/columns/lessons-columns";
import { useLessons } from "@/features/lessons/hooks/useLessons";
import { useDeleteLesson } from "@/features/lessons/hooks/useLessons";
import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LessonsContent() {
	const searchParams = useSearchParams();
	const moduleId = searchParams.get("moduleId") ?? "";

	const { data, isLoading, isError } = useLessons(moduleId);
	const { mutate: deleteLesson } = useDeleteLesson(moduleId);
	const columns = useMemo(
		() => buildLessonsColumns((id) => deleteLesson(id)),
		[deleteLesson],
	);

	if (!moduleId) {
		return (
			<p className="text-sm text-muted-foreground">
				Selecciona un módulo para ver sus lecciones.
			</p>
		);
	}

	return (
		<>
			{isLoading && (
				<p className="text-sm text-muted-foreground">Cargando lecciones…</p>
			)}
			{isError && (
				<p className="text-sm text-destructive">
					Error al cargar lecciones. Verifica que la API esté disponible.
				</p>
			)}
			{!isLoading && (
				<DataTable
					columns={columns}
					data={data ?? []}
					searchPlaceholder="Buscar lecciones…"
				/>
			)}
		</>
	);
}

export default function LessonsPage() {
	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-foreground">Lecciones</h2>
				<p className="text-sm text-muted-foreground">
					Gestiona las lecciones de los módulos.
				</p>
			</div>
			<Suspense
				fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
				<LessonsContent />
			</Suspense>
		</div>
	);
}
