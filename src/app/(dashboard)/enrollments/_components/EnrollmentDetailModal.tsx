"use client";

import type { Enrollment, EnrollmentStatus } from "@/types";
import { X, User, BookOpen, Clock, Tag, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnrollmentDetailModalProps {
	enrollment: Enrollment | null;
	isOpen: boolean;
	onClose: () => void;
	userMap: Record<string, string>;
	courseMap: Record<string, string>;
	onCancel: (id: string) => void;
	canManage: boolean;
}

const STATUS_BADGE: Record<EnrollmentStatus, { label: string; className: string }> = {
	ENROLLED: { label: "Matriculado", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
	ACTIVE: { label: "Activo", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
	COMPLETED: { label: "Completado", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
	CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export function EnrollmentDetailModal({
	enrollment,
	isOpen,
	onClose,
	userMap,
	courseMap,
	onCancel,
	canManage,
}: EnrollmentDetailModalProps) {
	if (!isOpen || !enrollment) return null;

	const status = (enrollment.status ?? "ENROLLED") as EnrollmentStatus;
	const badge = STATUS_BADGE[status] ?? STATUS_BADGE.ENROLLED;
	const studentName = enrollment.user_full_name ?? userMap[enrollment.user_id] ?? "Estudiante";
	const courseName = enrollment.course_title ?? courseMap[enrollment.course_id] ?? "Curso";
	const type = enrollment.course_type;
	const pct = enrollment.progress_percentage ?? 0;
	const isCancelled = status === "CANCELLED";

	return (
		<div
			className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="relative w-full max-w-lg rounded-xl border border-border bg-background shadow-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30 shrink-0">
					<div>
						<h2 className="text-lg font-semibold text-foreground leading-tight">
							Detalles de Matrícula
						</h2>
						<p className="text-sm text-muted-foreground">Información de inscripción al curso.</p>
					</div>
					<button
						onClick={onClose}
						className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-5 overflow-y-auto space-y-6">
					
					{/* Status section */}
					<div className="flex flex-wrap gap-3">
						<div className="flex-1 rounded-lg border border-border p-3 flex flex-col justify-center items-center bg-card">
							<span className="text-xs font-medium text-muted-foreground mb-1">Estado actual</span>
							<span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider", badge.className)}>
								{badge.label}
							</span>
						</div>
						<div className="flex-1 rounded-lg border border-border p-3 flex flex-col justify-center items-center bg-card">
							<span className="text-xs font-medium text-muted-foreground mb-1">Tipo de Curso</span>
							{type ? (
								<span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", type === "PAID" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400")}>
									{type === "PAID" ? "Pago" : "Gratis"}
								</span>
							) : (
								<span className="text-sm font-semibold">—</span>
							)}
						</div>
					</div>

					{/* Course & Student Grid */}
					<div className="space-y-4 border border-border rounded-lg p-4 bg-muted/10">
						<div className="flex items-start gap-3">
							<BookOpen className="h-5 w-5 text-primary mt-0.5" />
							<div>
								<p className="text-xs text-muted-foreground">Curso</p>
								<p className="text-sm font-medium">{courseName}</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<User className="h-5 w-5 text-primary mt-0.5" />
							<div>
								<p className="text-xs text-muted-foreground">Estudiante</p>
								<p className="text-sm font-medium">{studentName}</p>
							</div>
						</div>
					</div>

					{/* Progress and Dates */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium text-foreground border-b border-border pb-2">Desempeño y Fechas</h3>
						
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="flex flex-col gap-1.5 col-span-full sm:col-span-1">
								<p className="text-xs text-muted-foreground">Progreso del estudiante</p>
								<div className="flex items-center gap-3">
									<div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
										<div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
									</div>
									<span className="text-sm font-bold">{pct.toFixed(0)}%</span>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
								<div>
									<p className="text-xs text-muted-foreground">Matriculado el</p>
									<p className="text-sm font-medium">
										{enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString("es-PE", {
											day: "2-digit",
											month: "long",
											year: "numeric",
										}) : "—"}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Footer Actions */}
				{canManage && (
					<div className="border-t border-border bg-muted/30 px-6 py-4 shrink-0 flex justify-end">
						<button
							onClick={() => {
								if (window.confirm("¿Seguro que deseas cancelar esta matrícula? Esta acción no se puede deshacer y retirará el acceso del usuario.")) {
									onClose();
									onCancel(enrollment.id);
								}
							}}
							disabled={isCancelled}
							className={cn(
								"inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
								isCancelled 
									? "bg-muted text-muted-foreground cursor-not-allowed opacity-60" 
									: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
							)}
						>
							<XCircle className="h-4 w-4" />
							{isCancelled ? "Matrícula Cancelada" : "Cancelar Matrícula"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
