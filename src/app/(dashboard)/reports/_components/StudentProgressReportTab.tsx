"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { TableSkeleton } from "@/components/ui/skeleton";
import { buildStudentProgressReportColumns } from "@/components/tables/columns/reports-columns";
import { ExportPdfButton } from "@/components/shared/ExportPdfButton";
import { useStudentProgressReport } from "@/features/reports/hooks/useReports";
import { useCoursesCatalog } from "@/hooks/useCatalog";
import type { EnrollmentStatus } from "@/types";

const STATUS_OPTIONS: { value: EnrollmentStatus | "ALL"; label: string }[] = [
	{ value: "ALL", label: "Todos los estados" },
	{ value: "ENROLLED", label: "Matriculado" },
	{ value: "ACTIVE", label: "Activo" },
	{ value: "COMPLETED", label: "Completado" },
	{ value: "CANCELLED", label: "Cancelado" },
];

export function StudentProgressReportTab() {
	const { courses } = useCoursesCatalog();
	const [courseId, setCourseId] = useState("ALL");
	const [status, setStatus] = useState<EnrollmentStatus | "ALL">("ALL");

	const { data, isLoading, isError } = useStudentProgressReport({
		course_id: courseId !== "ALL" ? courseId : undefined,
		status: status !== "ALL" ? status : undefined,
		skip: 0,
		limit: 50,
	});

	const columns = useMemo(() => buildStudentProgressReportColumns(), []);

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border">
				<div className="flex flex-wrap items-center gap-2">
					<select
						value={courseId}
						onChange={(e) => setCourseId(e.target.value)}
						className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
						<option value="ALL">Todos los cursos</option>
						{courses.map((c) => (
							<option key={c.id} value={c.id}>
								{c.title}
							</option>
						))}
					</select>

					<select
						value={status}
						onChange={(e) => setStatus(e.target.value as EnrollmentStatus | "ALL")}
						className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
						{STATUS_OPTIONS.map((o) => (
							<option key={o.value} value={o.value}>
								{o.label}
							</option>
						))}
					</select>
				</div>

				<ExportPdfButton
					title="Reporte de progreso de estudiantes"
					subtitle={`Generado el ${new Date().toLocaleDateString("es-PE")}`}
					fileName="reporte-progreso-estudiantes"
					data={data ?? []}
					columns={[
						{ header: "Estudiante", accessor: (r) => r.student_name },
						{ header: "Correo", accessor: (r) => r.student_email },
						{ header: "Curso", accessor: (r) => r.course_title },
						{ header: "Estado", accessor: (r) => r.status },
						{ header: "Progreso", accessor: (r) => `${r.progress_percentage.toFixed(0)}%` },
						{ header: "Lecciones", accessor: (r) => `${r.completed_lessons}/${r.total_lessons}` },
						{
							header: "Matriculado el",
							accessor: (r) => new Date(r.enrolled_at).toLocaleDateString("es-PE"),
						},
					]}
				/>
			</div>

			{isLoading && (
				<div className="rounded-xl border border-border bg-card p-4">
					<TableSkeleton rows={6} columns={7} />
				</div>
			)}
			{isError && (
				<p className="text-sm text-destructive">
					Error al cargar el reporte. Verifica que la API esté disponible.
				</p>
			)}

			{!isLoading && !isError && (
				<DataTable columns={columns} data={data ?? []} hideSearch />
			)}
		</div>
	);
}
