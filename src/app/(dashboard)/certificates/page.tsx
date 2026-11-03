"use client";

import { useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";
import { DataTable } from "@/components/tables/DataTable";
import { MobilePager } from "@/components/tables/MobilePager";
import { TableEmpty, TableError } from "@/components/tables/TableStates";
import { TableSkeleton } from "@/components/ui/skeleton";
import { buildCertificatesColumns } from "@/components/tables/columns/certificates-columns";
import {
	useCertificatesList,
	useDeleteCertificate,
} from "@/features/certificates/hooks/useCertificates";
import { useServerTable } from "@/hooks/useServerTable";
import { CertificateModal } from "@/components/shared/CertificateModal";
import { studentName } from "@/lib/display";
import type { Certificate } from "@/types";
import { CertificateFilters } from "./_components/CertificateFilters";
import { CertificateCard } from "./_components/CertificateCard";
import { CertificateDetailModal } from "./_components/CertificateDetailModal";

const PAGE_SIZES = [10, 25, 50, 100];

export default function CertificatesPage() {
	// Search + pagination run on the server: the API filters by student, DNI,
	// course or code across ALL certificates, returns the names already
	// resolved, and sends the real total in X-Total-Count. No user/course
	// catalogs are downloaded just to translate ids into names.
	const table = useServerTable({ pageSize: 25 });
	const { data, isLoading, isError, isFetching, refetch } = useCertificatesList({
		skip: table.skip,
		limit: table.limit,
		q: table.search || undefined,
	});
	const deleteCertificate = useDeleteCertificate();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCert, setEditingCert] = useState<Certificate | null>(null);
	const [viewingCert, setViewingCert] = useState<Certificate | null>(null);

	const items = data?.items ?? [];
	const hasFilters = table.searchInput.trim() !== "";

	const columns = useMemo(
		() =>
			buildCertificatesColumns(
				(cert) => {
					setEditingCert(cert);
					setIsModalOpen(true);
				},
				(id) => deleteCertificate.mutate(id),
			),
		[deleteCertificate],
	);

	function handleOpenCreate() {
		setEditingCert(null);
		setIsModalOpen(true);
	}

	function handleCloseModal() {
		setIsModalOpen(false);
		setEditingCert(null);
	}

	const emptyState = (
		<TableEmpty
			entity="certificados"
			hasFilters={hasFilters}
			onClearFilters={() => table.setSearchInput("")}
		/>
	);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h2 className="text-xl font-semibold text-foreground">Certificados</h2>
					<p className="text-sm text-muted-foreground">
						Lista de certificados generados en la plataforma.
					</p>
				</div>
				<button
					type="button"
					onClick={handleOpenCreate}
					className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
					<PlusCircle aria-hidden="true" className="h-4 w-4" />
					Emitir certificado
				</button>
			</div>

			<CertificateFilters
				searchQuery={table.searchInput}
				onSearchChange={table.setSearchInput}
				isSearchPending={table.isSearchPending}
			/>

			{isLoading && (
				<div className="rounded-xl border border-border bg-card p-4">
					<TableSkeleton rows={8} columns={4} />
				</div>
			)}

			{isError && !data && (
				<TableError
					message="No se pudieron cargar los certificados."
					onRetry={() => refetch()}
					isRetrying={isFetching}
				/>
			)}

			{data && (
				<>
					<div className="hidden md:block">
						<DataTable
							columns={columns}
							data={items}
							ariaLabel="Certificados emitidos"
							getRowAriaLabel={(c) => `Ver certificado de ${studentName(c)}`}
							hideSearch
							manualPagination
							pagination={table.pagination}
							onPaginationChange={table.setPagination}
							pageSizeOptions={PAGE_SIZES}
							totalRecords={data.total}
							rowCount={items.length}
							isFetching={isFetching}
							emptyState={emptyState}
							onRowClick={setViewingCert}
						/>
					</div>

					<div className="md:hidden">
						{items.length > 0 ? (
							<div
								aria-busy={isFetching}
								className={`grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 motion-reduce:transition-none ${isFetching ? "opacity-70" : ""}`}>
								{items.map((cert) => (
									<CertificateCard
										key={cert.id}
										certificate={cert}
										onClick={() => setViewingCert(cert)}
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

			<CertificateModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				certificate={editingCert}
			/>

			<CertificateDetailModal
				certificate={viewingCert}
				isOpen={!!viewingCert}
				onClose={() => setViewingCert(null)}
				onEdit={(cert) => {
					setEditingCert(cert);
					setIsModalOpen(true);
				}}
				onDelete={(id) => deleteCertificate.mutate(id)}
			/>
		</div>
	);
}
