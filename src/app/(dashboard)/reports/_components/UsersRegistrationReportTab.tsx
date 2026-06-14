"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { TableSkeleton } from "@/components/ui/skeleton";
import { buildUsersRegistrationReportColumns } from "@/components/tables/columns/reports-columns";
import { ExportPdfButton } from "@/components/shared/ExportPdfButton";
import { useUsersRegistrationReport } from "@/features/reports/hooks/useReports";
import { useRoles } from "@/features/roles/hooks/useRoles";

export function UsersRegistrationReportTab() {
	const { data: roles } = useRoles();
	const [roleId, setRoleId] = useState("ALL");
	const [isActive, setIsActive] = useState<"ALL" | "true" | "false">("ALL");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	const { data, isLoading, isError } = useUsersRegistrationReport({
		role_id: roleId !== "ALL" ? roleId : undefined,
		is_active: isActive !== "ALL" ? isActive === "true" : undefined,
		start_date: startDate || undefined,
		end_date: endDate || undefined,
	});

	const columns = useMemo(() => buildUsersRegistrationReportColumns(), []);

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

					<select
						value={isActive}
						onChange={(e) => setIsActive(e.target.value as "ALL" | "true" | "false")}
						className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
						<option value="ALL">Todos los estados</option>
						<option value="true">Activos</option>
						<option value="false">Inactivos</option>
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
					title="Reporte de registro de usuarios"
					subtitle={`Generado el ${new Date().toLocaleDateString("es-PE")}`}
					fileName="reporte-registro-usuarios"
					data={data ?? []}
					columns={[
						{ header: "Mes", accessor: (r) => r.month ?? "—" },
						{ header: "Rol", accessor: (r) => r.role_name },
						{ header: "Estado", accessor: (r) => (r.is_active ? "Activo" : "Inactivo") },
						{ header: "Total", accessor: (r) => r.total },
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
