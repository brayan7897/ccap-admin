"use client";

import type { Certificate } from "@/types";
import { X, Pencil, Trash2, Award, User, BookOpen, Clock, FileKey, ExternalLink } from "lucide-react";
import { Portal } from "@/components/shared/Portal";

interface CertificateDetailModalProps {
	certificate: Certificate | null;
	isOpen: boolean;
	onClose: () => void;
	userMap: Record<string, string>;
	courseMap: Record<string, string>;
	onEdit: (certificate: Certificate) => void;
	onDelete: (id: string) => void;
}

export function CertificateDetailModal({
	certificate,
	isOpen,
	onClose,
	userMap,
	courseMap,
	onEdit,
	onDelete,
}: CertificateDetailModalProps) {
	if (!isOpen || !certificate) return null;

	const studentName = userMap[certificate.user_id] ?? certificate.user_id;
	const courseName = courseMap[certificate.course_id] ?? certificate.course_id;

	return (
		<Portal>
			<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0">
			<div className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30 shrink-0">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary/10 rounded-md">
							<Award className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-foreground leading-tight">
								Detalles de Certificado
							</h2>
						</div>
					</div>
					<button
						onClick={onClose}
						className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors self-start"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5 overflow-y-auto space-y-6">
					
					{/* Metadata Grid */}
					<div className="space-y-4">
						<div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
							<BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
							<div>
								<p className="text-xs text-muted-foreground">Curso</p>
								<p className="text-sm font-medium">{courseName}</p>
							</div>
						</div>
						
						<div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
							<User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
							<div>
								<p className="text-xs text-muted-foreground">Estudiante</p>
								<p className="text-sm font-medium">{studentName}</p>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
								<FileKey className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
								<div>
									<p className="text-xs text-muted-foreground">Código de verificación</p>
									<p className="text-sm font-mono font-medium">{certificate.certificate_code}</p>
								</div>
							</div>

							<div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card">
								<Clock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
								<div>
									<p className="text-xs text-muted-foreground">Fecha de emisión</p>
									<p className="text-sm font-medium">
										{new Date(certificate.issued_at).toLocaleDateString("es-PE", {
											day: "2-digit",
											month: "long",
											year: "numeric"
										})}
									</p>
								</div>
							</div>
						</div>
						
						{certificate.pdf_url && (
							<div className="pt-2">
								<a
									href={certificate.pdf_url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
								>
									<ExternalLink className="h-4 w-4" />
									Ver Certificado Original
								</a>
							</div>
						)}
					</div>
				</div>

				{/* Footer Actions */}
				<div className="border-t border-border bg-muted/30 px-6 py-4 shrink-0 flex flex-wrap gap-2 justify-end">
					<button
						onClick={() => {
							onClose();
							onEdit(certificate);
						}}
						className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
					>
						<Pencil className="h-4 w-4" />
						Editar
					</button>
					<button
						onClick={() => {
							if (window.confirm("¿Estás seguro de eliminar este certificado? Esta acción no se puede deshacer.")) {
								onClose();
								onDelete(certificate.id);
							}
						}}
						className="inline-flex items-center gap-2 rounded-md border border-destructive bg-transparent px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors ml-auto sm:ml-0"
					>
						<Trash2 className="h-4 w-4" />
						Eliminar
					</button>
				</div>
			</div>
			</div>
		</Portal>
	);
}
