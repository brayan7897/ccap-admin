"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { TableSkeleton } from "@/components/ui/skeleton";
import { buildEnrollmentsReportColumns } from "@/components/tables/columns/reports-columns";
import { ExportPdfButton } from "@/components/shared/ExportPdfButton";
import { useEnrollmentsReport } from "@/features/reports/hooks/useReports";
import { useCoursesCatalog } from "@/hooks/useCatalog";
import type { EnrollmentStatus } from "@/types";

const STATUS_OPTIONS: { value: EnrollmentStatus | "ALL"; label: string }[] = [
	{ value: "ALL", label: "Todos los estados" },
	{ value: "ENROLLED", label: "Matriculado" },
	{ value: "ACTIVE", label: "Activo" },
	{ value: "COMPLETED", label: "Completado" },
	{ value: "CANCELLED", label: "Cancelado" },
];

export function EnrollmentsReportTab() {
	const { courses } = useCoursesCatalog();
	const [courseId, setCourseId] = useState("ALL");
	const [status, setStatus] = useState<EnrollmentStatus | "ALL">("ALL");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	const { data, isLoading, isError } = useEnrollmentsReport({
		course_id: courseId !== "ALL" ? courseId : undefined,
		status: status !== "ALL" ? status : undefined,
		start_date: startDate || undefined,
		end_date: endDate || undefined,
	});

	const columns = useMemo(() => buildEnrollmentsReportColumns(), []);

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

					<input
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
					/>
					<input
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
					/>
				</div>

				<ExportPdfButton
					title="Reporte de matrículas"
					subtitle={`Generado el ${new Date().toLocaleDateString("es-PE")}`}
					fileName="reporte-matriculas"
					data={data ?? []}
					columns={[
						{ header: "Curso", accessor: (r) => r.course_title },
						{ header: "Mes", accessor: (r) => r.month ?? "—" },
						{ header: "Matrículas", accessor: (r) => r.enrollments },
						{ header: "Completados", accessor: (r) => r.completions },
					]}
				/>
			</div>

			{isLoading && (
				<div className="rounded-xl border border-border bg-card p-4">
					<TableSkeleton rows={6} columns={4} />
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
