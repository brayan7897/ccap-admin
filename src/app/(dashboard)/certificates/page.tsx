"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import { buildCertificatesColumns } from "@/components/tables/columns/certificates-columns";
import {
	useCertificates,
	useDeleteCertificate,
} from "@/features/certificates/hooks/useCertificates";
import { useUsersCatalog, useCoursesCatalog } from "@/hooks/useCatalog";
import { CertificateModal } from "@/components/shared/CertificateModal";
import type { Certificate } from "@/types";
import { PlusCircle } from "lucide-react";
import { CertificateFilters } from "./_components/CertificateFilters";
import { CertificateCard } from "./_components/CertificateCard";
import { CertificateDetailModal } from "./_components/CertificateDetailModal";

export default function CertificatesPage() {
	// Server-side pagination (same pattern as CoursesPage) — the list was
	// previously hardcoded to the first 50 certificates ever issued with no way
	// to reach anything past that, and the "N registros en total" footer showed
	// that capped count as if it were the true total.
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
	const { data, isLoading, isError } = useCertificates(
		pagination.pageIndex * pagination.pageSize,
		pagination.pageSize,
	);
	const deleteCertificate = useDeleteCertificate();
	const { users } = useUsersCatalog();
	const { courses } = useCoursesCatalog();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCert, setEditingCert] = useState<Certificate | null>(null);
	const [viewingCert, setViewingCert] = useState<Certificate | null>(null);
	const [searchQuery, setSearchQuery] = useState("");

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
		const search = searchQuery.length >= 3 ? searchQuery.toLowerCase() : "";
		return data.filter((c) => {
			const studentName = (userMap[c.user_id] ?? c.user_id).toLowerCase();
			const courseName = (courseMap[c.course_id] ?? c.course_id).toLowerCase();
			const code = c.certificate_code.toLowerCase();
			return !search || studentName.includes(search) || courseName.includes(search) || code.includes(search);
		});
	}, [data, searchQuery, userMap, courseMap]);

	const columns = useMemo(
		() =>
			buildCertificatesColumns(
				(cert) => {
					setEditingCert(cert);
					setIsModalOpen(true);
				},
				(id) => deleteCertificate.mutate(id),
				userMap,
				courseMap,
			),
		[deleteCertificate, userMap, courseMap],
	);

	function handleOpenCreate() {
		setEditingCert(null);
		setIsModalOpen(true);
	}

	function handleCloseModal() {
		setIsModalOpen(false);
		setEditingCert(null);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-foreground">
						Certificados
					</h2>
					<p className="text-sm text-muted-foreground">
						Lista de certificados generados en la plataforma.
					</p>
				</div>
				<button
					onClick={handleOpenCreate}
					className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
					<PlusCircle className="h-4 w-4" />
					Emitir certificado
				</button>
			</div>

			{isLoading && (
				<p className="text-sm text-muted-foreground">Cargando certificados…</p>
			)}
			{isError && (
				<p className="text-sm text-destructive">
					Error al cargar certificados. Verifica que la API esté disponible.
				</p>
			)}

			{!isLoading && !isError && (
				<>
					<CertificateFilters
						searchQuery={searchQuery}
						onSearchChange={setSearchQuery}
					/>

					<div className="hidden md:block">
						<DataTable
							columns={columns}
							data={filteredData}
							rowCount={data?.length ?? 0}
							searchPlaceholder="Buscar certificados…"
							hideSearch
							manualPagination
							pagination={pagination}
							onPaginationChange={setPagination}
							onRowClick={setViewingCert}
						/>
					</div>

					<div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
						{filteredData.length > 0 ? (
							filteredData.map((cert) => (
								<CertificateCard
									key={cert.id}
									certificate={cert}
									userMap={userMap}
									courseMap={courseMap}
									onClick={() => setViewingCert(cert)}
								/>
							))
						) : (
							<div className="col-span-full py-8 text-center text-sm text-muted-foreground bg-card border border-border rounded-xl">
								No se encontraron certificados que coincidan con la búsqueda.
							</div>
						)}
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
				userMap={userMap}
				courseMap={courseMap}
				onEdit={(cert) => {
					setEditingCert(cert);
					setIsModalOpen(true);
				}}
				onDelete={(id) => deleteCertificate.mutate(id)}
			/>
		</div>
	);
}
