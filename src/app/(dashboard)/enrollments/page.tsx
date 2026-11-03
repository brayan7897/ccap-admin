"use client";

import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable";
import { MobilePager } from "@/components/tables/MobilePager";
import { TableEmpty, TableError } from "@/components/tables/TableStates";
import { TableSkeleton } from "@/components/ui/skeleton";
import { buildEnrollmentsColumns } from "@/components/tables/columns/enrollments-columns";
import {
	useEnrollmentsList,
	useCancelEnrollment,
} from "@/features/enrollments/hooks/useEnrollments";
import { useServerTable } from "@/hooks/useServerTable";
import { usePermissions } from "@/hooks/usePermissions";
import { EnrollmentModal } from "@/components/shared/EnrollmentModal";
import { studentName } from "@/lib/display";
import type { Enrollment, EnrollmentStatus } from "@/types";
import { EnrollmentFilters } from "./_components/EnrollmentFilters";
import { EnrollmentCard } from "./_components/EnrollmentCard";
import { EnrollmentDetailModal } from "./_components/EnrollmentDetailModal";

const PAGE_SIZES = [10, 25, 50, 100];

export default function EnrollmentsPage() {
	// Search, status filter and pagination run on the server: the API filters
	// across ALL enrollments, returns student + course names already resolved
	// and sends the real total in X-Total-Count. No user/course catalogs are
	// downloaded just to translate ids into names.
	const table = useServerTable({ pageSize: 25 });
	const [statusFilter, setStatusFilter] = useState<EnrollmentStatus | "ALL">("ALL");

	const { data, isLoading, isError, isFetching, refetch } = useEnrollmentsList({
		skip: table.skip,
		limit: table.limit,
		q: table.search || undefined,
		status: statusFilter === "ALL" ? undefined : statusFilter,
	});
	const cancelEnrollment = useCancelEnrollment();

	const { hasPermission } = usePermissions();
	const canManage = hasPermission("enrollment:manage");

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedViewEnrollment, setSelectedViewEnrollment] = useState<Enrollment | null>(null);

	const items = data?.items ?? [];
	const hasFilters = table.searchInput.trim() !== "" || statusFilter !== "ALL";

	const columns = useMemo(
		() => buildEnrollmentsColumns((id) => cancelEnrollment.mutate(id), canManage),
		[cancelEnrollment, canManage],
	);

	function handleStatusChange(next: EnrollmentStatus | "ALL") {
		setStatusFilter(next);
		table.resetPage();
	}

	function clearFilters() {
		table.setSearchInput("");
		setStatusFilter("ALL");
		table.resetPage();
	}

	const emptyState = (
		<TableEmpty
			entity="matrículas"
			hasFilters={hasFilters}
			onClearFilters={clearFilters}
			action={
				canManage ? (
					<button
						type="button"
						onClick={() => setIsModalOpen(true)}
						className="cursor-pointer rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
						Matricular usuario
					</button>
				) : undefined
			}
		/>
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-xl font-semibold text-foreground">Matrículas</h2>
					<p className="text-sm text-muted-foreground">
						Gestiona las matrículas de los usuarios en cursos.
					</p>
				</div>

				{canManage && (
					<button
						type="button"
						onClick={() => setIsModalOpen(true)}
						className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
						<UserPlus aria-hidden="true" className="h-4 w-4" />
						Matricular usuario
					</button>
				)}
			</div>

			<EnrollmentFilters
				searchQuery={table.searchInput}
				onSearchChange={table.setSearchInput}
				isSearchPending={table.isSearchPending}
				statusFilter={statusFilter}
				onStatusChange={handleStatusChange}
				onClear={clearFilters}
			/>

			{isLoading && (
				<div className="rounded-xl border border-border bg-card p-4">
					<TableSkeleton rows={8} columns={5} />
				</div>
			)}

			{isError && !data && (
				<TableError
					message="No se pudieron cargar las matrículas."
					onRetry={() => refetch()}
					isRetrying={isFetching}
				/>
			)}

			{data && (
				<>
					{/* Desktop table (hidden on small screens) */}
					<div className="hidden md:block">
						<DataTable
							columns={columns}
							data={items}
							ariaLabel="Matrículas"
							getRowAriaLabel={(e) => `Ver matrícula de ${studentName(e)}`}
							hideSearch
							manualPagination
							pagination={table.pagination}
							onPaginationChange={table.setPagination}
							pageSizeOptions={PAGE_SIZES}
							totalRecords={data.total}
							rowCount={items.length}
							isFetching={isFetching}
							emptyState={emptyState}
							onRowClick={setSelectedViewEnrollment}
						/>
					</div>

					{/* Mobile/tablet cards (hidden on md and larger) */}
					<div className="md:hidden">
						{items.length > 0 ? (
							<div
								aria-busy={isFetching}
								className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 motion-reduce:transition-none ${isFetching ? "opacity-70" : ""}`}>
								{items.map((enrollment) => (
									<EnrollmentCard
										key={enrollment.id}
										enrollment={enrollment}
										onClick={() => setSelectedViewEnrollment(enrollment)}
									/>
								))}
							</div>
						) : (
							<div className="rounded-xl border border-border bg-card">{emptyState}</div>
						)}
						<MobilePager
							pageIndex={table.pagination.pageIndex}
							pageSize={table.pagination.pageSize}
							total={data.total}
							onChange={(pageIndex) =>
								table.setPagination((p) => ({ ...p, pageIndex }))
							}
						/>
					</div>
				</>
			)}

			<EnrollmentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

			<EnrollmentDetailModal
				enrollment={selectedViewEnrollment}
				isOpen={!!selectedViewEnrollment}
				onClose={() => setSelectedViewEnrollment(null)}
				onCancel={(id) => cancelEnrollment.mutate(id)}
				canManage={canManage}
			/>
		</div>
	);
}
