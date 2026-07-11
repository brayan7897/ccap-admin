"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { TableSkeleton } from "@/components/ui/skeleton";
import { buildActivityReportColumns } from "@/components/tables/columns/reports-columns";
import { ExportPdfButton } from "@/components/shared/ExportPdfButton";
import { useActivityReport } from "@/features/reports/hooks/useReports";
import { useRoles } from "@/features/roles/hooks/useRoles";

export function ActivityReportTab() {
	const { data: roles } = useRoles();
	const [roleId, setRoleId] = useState("ALL");

	// limit matches the backend's max (le=200) — see StudentProgressReportTab
	// for why this was bumped from 50.
	const { data, isLoading, isError } = useActivityReport({
		role_id: roleId !== "ALL" ? roleId : undefined,
		skip: 0,
		limit: 200,
	});

	const columns = useMemo(() => buildActivityReportColumns(), []);

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between bg-card p-4 rounded-xl border border-border">
				<div className="flex flex-wrap items-center gap-2">
					<select
						value={roleId}
						onChange={(e) => setRoleId(e.target.value)}
						className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
						<option value="ALL">Todos los roles</option>
						{(roles ?? []).map((r) => (
							<option key={r.id} value={r.id}>
								{r.name}
							</option>
						))}
					</select>
				</div>

				<ExportPdfButton
					title="Reporte de actividad de usuarios"
					subtitle={`Generado el ${new Date().toLocaleDateString("es-PE")}`}
					fileName="reporte-actividad-usuarios"
					data={data ?? []}
					columns={[
						{ header: "Nombre", accessor: (r) => r.full_name },
						{ header: "Correo", accessor: (r) => r.email },
						{ header: "Rol", accessor: (r) => r.role_name },
						{ header: "Estado", accessor: (r) => (r.is_active ? "Activo" : "Inactivo") },
						{
							header: "Último acceso",
							accessor: (r) => (r.last_login_at ? new Date(r.last_login_at).toLocaleString("es-PE") : "Nunca"),
						},
						{ header: "Sesiones", accessor: (r) => r.total_sessions },
					]}
				/>
			</div>

			{isLoading && (
				<div className="rounded-xl border border-border bg-card p-4">
					<TableSkeleton rows={6} columns={6} />
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
