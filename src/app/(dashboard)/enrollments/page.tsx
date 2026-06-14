"use client";

import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable";
import { TableSkeleton } from "@/components/ui/skeleton";
import { buildEnrollmentsColumns } from "@/components/tables/columns/enrollments-columns";
import {
	useEnrollments,
	useCancelEnrollment,
} from "@/features/enrollments/hooks/useEnrollments";
import { useUsersCatalog, useCoursesCatalog } from "@/hooks/useCatalog";
import { usePermissions } from "@/hooks/usePermissions";
import { EnrollmentModal } from "@/components/shared/EnrollmentModal";
import type { Enrollment, EnrollmentStatus } from "@/types";
import { EnrollmentFilters } from "./_components/EnrollmentFilters";
import { EnrollmentCard } from "./_components/EnrollmentCard";
import { EnrollmentDetailModal } from "./_components/EnrollmentDetailModal";

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
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedViewEnrollment, setSelectedViewEnrollment] = useState<Enrollment | null>(null);

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
		return data.filter((e) => {
			const matchesStatus = statusFilter === "ALL" || e.status === statusFilter;
			
			const studentName = (e.user_full_name ?? userMap[e.user_id] ?? "").toLowerCase();
			const courseName = (e.course_title ?? courseMap[e.course_id] ?? "").toLowerCase();
			const search = searchQuery.toLowerCase();
			
			const matchesSearch = !search || studentName.includes(search) || courseName.includes(search);
			
			return matchesStatus && matchesSearch;
		});
	}, [data, statusFilter, searchQuery, userMap, courseMap]);

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

	function handleCancel(id: string) {
		cancelEnrollment.mutate(id);
	}

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
				<div className="rounded-xl border border-border bg-card p-4">
					<TableSkeleton rows={6} columns={5} />
				</div>
			)}
			{isError && (
				<p className="text-sm text-destructive">
					Error al cargar matrículas. Verifica que la API esté disponible.
				</p>
			)}

			{!isLoading && !isError && (
				<>
					{/* Filtros */}
					<EnrollmentFilters
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
						statusFilter={statusFilter}
						onStatusChange={setStatusFilter}
					/>

					{/* Desktop Table (Hidden on small screens) */}
					<div className="hidden md:block">
						<DataTable
							columns={columns}
							data={filteredData}
							searchPlaceholder="Buscar en resultados..."
							hideSearch
							onRowClick={setSelectedViewEnrollment}
						/>
					</div>

					{/* Mobile/Tablet Cards (Hidden on md and larger) */}
					<div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
						{filteredData.length > 0 ? (
							filteredData.map((enrollment) => (
								<EnrollmentCard
									key={enrollment.id}
									enrollment={enrollment}
									userMap={userMap}
									courseMap={courseMap}
									onClick={() => setSelectedViewEnrollment(enrollment)}
								/>
							))
						) : (
							<div className="col-span-full py-8 text-center text-sm text-muted-foreground bg-card border border-border rounded-xl">
								No se encontraron matrículas que coincidan con los filtros.
							</div>
						)}
					</div>
				</>
			)}

			<EnrollmentModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>
			
			<EnrollmentDetailModal
				enrollment={selectedViewEnrollment}
				isOpen={!!selectedViewEnrollment}
				onClose={() => setSelectedViewEnrollment(null)}
				userMap={userMap}
				courseMap={courseMap}
				onCancel={handleCancel}
				canManage={canManage}
			/>
		</div>
	);
}
