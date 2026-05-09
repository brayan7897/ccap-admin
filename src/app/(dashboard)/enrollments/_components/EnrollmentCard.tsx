"use client";

import type { Enrollment, EnrollmentStatus } from "@/types";
import { User, BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<EnrollmentStatus, { label: string; className: string }> = {
	ENROLLED: { label: "Matriculado", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
	ACTIVE: { label: "Activo", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
	COMPLETED: { label: "Completado", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
	CANCELLED: { label: "Cancelado", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

interface EnrollmentCardProps {
	enrollment: Enrollment;
	userMap: Record<string, string>;
	courseMap: Record<string, string>;
	onClick: () => void;
}

export function EnrollmentCard({ enrollment, userMap, courseMap, onClick }: EnrollmentCardProps) {
	const status = (enrollment.status ?? "ENROLLED") as EnrollmentStatus;
	const badge = STATUS_BADGE[status] ?? STATUS_BADGE.ENROLLED;
	const studentName = enrollment.user_full_name ?? userMap[enrollment.user_id] ?? "Estudiante";
	const courseName = enrollment.course_title ?? courseMap[enrollment.course_id] ?? "Curso";
	const pct = enrollment.progress_percentage ?? 0;

	return (
		<div
			onClick={onClick}
			className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
		>
			<div className="p-4 flex-1">
				<div className="flex justify-between items-start gap-4 mb-3">
					<div className="flex-1">
						<span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
							<BookOpen className="h-3.5 w-3.5" /> Curso
						</span>
						<h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-2">
							{courseName}
						</h3>
					</div>
					<span className={cn("shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", badge.className)}>
						{badge.label}
					</span>
				</div>

				<div className="space-y-3">
					<div className="flex items-start gap-2">
						<User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
						<div>
							<p className="text-xs text-muted-foreground">Estudiante</p>
							<p className="text-sm font-medium text-foreground line-clamp-1">{studentName}</p>
						</div>
					</div>

					<div className="flex items-center justify-between gap-4">
						<div className="flex-1">
							<div className="flex items-center justify-between mb-1">
								<span className="text-xs font-medium text-muted-foreground">Progreso</span>
								<span className="text-xs font-bold">{pct.toFixed(0)}%</span>
							</div>
							<div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
								<div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
							</div>
						</div>
						
						{enrollment.enrolled_at && (
							<div className="shrink-0 text-right">
								<p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
									<Clock className="h-3 w-3" /> Inscripción
								</p>
								<p className="text-xs font-medium">
									{new Date(enrollment.enrolled_at).toLocaleDateString("es-PE", { month: "short", day: "numeric", year: "numeric" })}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
			<div className="border-t border-border bg-muted/20 px-4 py-2 text-center">
				<span className="text-xs font-medium text-primary">Ver detalles</span>
			</div>
		</div>
	);
}
