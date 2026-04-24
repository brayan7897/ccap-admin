"use client";

import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable";
import { buildEnrollmentsColumns } from "@/components/tables/columns/enrollments-columns";
import {
	useEnrollments,
	useCancelEnrollment,
} from "@/features/enrollments/hooks/useEnrollments";
import { useUsersCatalog, useCoursesCatalog } from "@/hooks/useCatalog";
import { usePermissions } from "@/hooks/usePermissions";
import { EnrollmentModal } from "@/components/shared/EnrollmentModal";
import type { EnrollmentStatus } from "@/types";

const STATUS_OPTIONS: { value: EnrollmentStatus | "ALL"; label: string }[] = [
	{ value: "ALL", label: "Todos los estados" },
	{ value: "ENROLLED", label: "Matriculado" },
	{ value: "ACTIVE", label: "Activo" },
	{ value: "COMPLETED", label: "Completado" },
	{ value: "CANCELLED", label: "Cancelado" },
];

export default function EnrollmentsPage() {
	const { data, isLoading, isError } = useEnrollments(0, 200);
	const cancelEnrollment = useCancelEnrollment();

	const { users } = useUsersCatalog();
	const { courses } = useCoursesCatalog();

	const { hasPermission } = usePermissions();
	const canManage = hasPermission("enrollment:manage");

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "ALL">(
		"ALL",
	);

	const userMap = useMemo<Record<string, string>>(
		() =>
			users.reduce<Record<string, string>>((acc, u) => {
				acc[u.id] = u.full_name ?? `${u.first_name} ${u.last_name}`.trim();
				return acc;
			}, {}),
		[users],
	);

	const courseMap = useMemo<Record<string, string>>(
		() =>
			courses.reduce<Record<string, string>>((acc, c) => {
				acc[c.id] = c.title;
				return acc;
			}, {}),
		[courses],
	);

	const filteredData = useMemo(() => {
		if (!data) return [];
		if (statusFilter === "ALL") return data;
		return data.filter((e) => e.status === statusFilter);
	}, [data, statusFilter]);

	const columns = useMemo(
		() =>
			buildEnrollmentsColumns(
				(id) => cancelEnrollment.mutate(id),
				userMap,
				courseMap,
				canManage,
			),
		[cancelEnrollment, userMap, courseMap, canManage],
	);

	const extraFilters = (
		<select
			value={statusFilter}
			onChange={(e) =>
				setStatusFilter(e.target.value as EnrollmentStatus | "ALL")
			}
			className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
			{STATUS_OPTIONS.map((o) => (
				<option key={o.value} value={o.value}>
					{o.label}
				</option>
			))}
		</select>
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-foreground">Matrículas</h2>
					<p className="text-sm text-muted-foreground">
						Gestiona las matrículas de los usuarios en cursos.
					</p>
				</div>

				{canManage && (
					<button
						onClick={() => setIsModalOpen(true)}
						className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
						<UserPlus className="h-4 w-4" />
						Matricular usuario
					</button>
				)}
			</div>

			{isLoading && (
				<p className="text-sm text-muted-foreground">Cargando matrículas…</p>
			)}
			{isError && (
				<p className="text-sm text-destructive">
					Error al cargar matrículas. Verifica que la API esté disponible.
				</p>
			)}

			{!isLoading && (
				<DataTable
					columns={columns}
					data={filteredData}
					searchPlaceholder="Buscar por curso o estudiante…"
					extraFilters={extraFilters}
				/>
			)}

			<EnrollmentModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
		</div>
	);
}
