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

export default function CertificatesPage() {
	const { data, isLoading, isError } = useCertificates();
	const deleteCertificate = useDeleteCertificate();
	const { users } = useUsersCatalog();
	const { courses } = useCoursesCatalog();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingCert, setEditingCert] = useState<Certificate | null>(null);

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

			{!isLoading && (
				<DataTable
					columns={columns}
					data={data ?? []}
					searchPlaceholder="Buscar certificados…"
				/>
			)}

			<CertificateModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				certificate={editingCert}
			/>
		</div>
	);
}
