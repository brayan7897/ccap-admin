"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { TableSkeleton } from "@/components/ui/skeleton";
import { buildCertificatesReportColumns } from "@/components/tables/columns/reports-columns";
import { ExportPdfButton } from "@/components/shared/ExportPdfButton";
import { useCertificatesReport } from "@/features/reports/hooks/useReports";
import { useCoursesCatalog } from "@/hooks/useCatalog";

export function CertificatesReportTab() {
	const { courses } = useCoursesCatalog();
	const [courseId, setCourseId] = useState("ALL");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	// limit matches the backend's max (le=200) — see StudentProgressReportTab
	// for why this was bumped from 50.
	const { data, isLoading, isError } = useCertificatesReport({
		course_id: courseId !== "ALL" ? courseId : undefined,
		start_date: startDate || undefined,
		end_date: endDate || undefined,
		skip: 0,
		limit: 200,
	});

	const columns = useMemo(() => buildCertificatesReportColumns(), []);

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
					title="Reporte de certificados emitidos"
					subtitle={`Generado el ${new Date().toLocaleDateString("es-PE")}`}
					fileName="reporte-certificados"
					data={data ?? []}
					columns={[
						{ header: "Código", accessor: (r) => r.certificate_code },
						{ header: "Estudiante", accessor: (r) => r.student_name },
						{ header: "Correo", accessor: (r) => r.student_email },
						{ header: "Curso", accessor: (r) => r.course_title },
						{
							header: "Emitido el",
							accessor: (r) => new Date(r.issued_at).toLocaleDateString("es-PE"),
						},
					]}
				/>
			</div>

			{isLoading && (
				<div className="rounded-xl border border-border bg-card p-4">
					<TableSkeleton rows={6} columns={5} />
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
