"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { Certificate } from "@/types";
import { CertificateForm } from "@/components/forms/CertificateForm";
import { certificatesService } from "@/features/certificates/services/certificates.service";
import { useUsersCatalog, useCoursesCatalog } from "@/hooks/useCatalog";
import type {
	CertificateCreateInput,
	CertificateEditInput,
} from "@/features/certificates/schemas/certificate.schema";

interface CertificateModalProps {
	isOpen: boolean;
	onClose: () => void;
	certificate?: Certificate | null;
}

export function CertificateModal({
	isOpen,
	onClose,
	certificate,
}: CertificateModalProps) {
	const qc = useQueryClient();
	const { users } = useUsersCatalog();
	const { courses } = useCoursesCatalog();

	const [pdfFile, setPdfFile] = useState<File | null>(null);
	const [isPending, setIsPending] = useState(false);

	if (!isOpen) return null;

	const isEditing = !!certificate;

	function handleClose() {
		setPdfFile(null);
		onClose();
	}

	async function handleSubmit(
		data: CertificateCreateInput | CertificateEditInput,
	) {
		setIsPending(true);
		try {
			if (!isEditing) {
				// Step 1 — create the certificate record
				const newCert = await certificatesService.create(
					data as CertificateCreateInput,
				);
				toast.success("Certificado creado.");

				// Step 2 — if a PDF was selected, upload it via the dedicated endpoint
				if (pdfFile) {
					try {
						await certificatesService.uploadPdf(newCert.id, pdfFile);
						toast.success("PDF subido correctamente.");
					} catch {
						toast.error(
							"Certificado creado, pero hubo un error al subir el PDF.",
						);
					}
				}
			} else {
				// Step 1 — patch editable metadata (html_content, pdf_url, drive_file_id)
				await certificatesService.update(
					certificate.id,
					data as CertificateEditInput,
				);
				toast.success("Certificado actualizado.");

				// Step 2 — upload/replace PDF if one was provided
				if (pdfFile) {
					try {
						await certificatesService.uploadPdf(certificate.id, pdfFile);
						toast.success("PDF subido correctamente.");
					} catch {
						toast.error(
							"Cambios guardados, pero hubo un error al subir el PDF.",
						);
					}
				}
			}

			qc.invalidateQueries({ queryKey: ["certificates"] });
			handleClose();
		} catch {
			toast.error(
				isEditing
					? "Error al actualizar el certificado."
					: "Error al crear el certificado.",
			);
		} finally {
			setIsPending(false);
		}
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
			onClick={(e) => {
				if (e.target === e.currentTarget) handleClose();
			}}>
			<div className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border px-6 py-4">
					<h2 className="text-base font-semibold text-foreground">
						{isEditing ? "Editar Certificado" : "Emitir Nuevo Certificado"}
					</h2>
					<button
						onClick={handleClose}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5">
					<CertificateForm
						mode={isEditing ? "edit" : "create"}
						defaultValues={certificate ?? undefined}
						onSubmit={handleSubmit}
						isLoading={isPending}
						users={users ?? []}
						courses={courses ?? []}
						pdfFile={pdfFile}
						onPdfFileChange={setPdfFile}
					/>
				</div>
			</div>
		</div>
	);
}
