"use client";

import type { Enrollment } from "@/types";
import { User, BookOpen, Clock } from "lucide-react";
import { courseName, formatDate, studentName } from "@/lib/display";
import { EnrollmentStatusBadge } from "@/components/shared/EnrollmentStatusBadge";

interface EnrollmentCardProps {
	enrollment: Enrollment;
	onClick: () => void;
}

export function EnrollmentCard({ enrollment, onClick }: EnrollmentCardProps) {
	const student = studentName(enrollment);
	const course = courseName(enrollment);
	const pct = Math.min(100, Math.max(0, enrollment.progress_percentage ?? 0));

	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={`Ver matrícula de ${student}`}
			className="flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
			<div className="flex-1 p-4">
				<div className="mb-3 flex items-start justify-between gap-4">
					<div className="min-w-0 flex-1">
						<span className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
							<BookOpen aria-hidden="true" className="h-3.5 w-3.5" /> Curso
						</span>
						<h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
							{course}
						</h3>
					</div>
					<EnrollmentStatusBadge status={enrollment.status} className="shrink-0" />
				</div>

				<div className="space-y-3">
					<div className="flex items-start gap-2">
						<User aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
						<div className="min-w-0">
							<p className="text-xs text-muted-foreground">Estudiante</p>
							<p className="line-clamp-1 text-sm font-medium text-foreground">{student}</p>
						</div>
					</div>

					<div className="flex items-center justify-between gap-4">
						<div className="flex-1">
							<div className="mb-1 flex items-center justify-between">
								<span className="text-xs font-medium text-muted-foreground">Progreso</span>
								<span className="text-xs font-bold tabular-nums">{pct.toFixed(0)}%</span>
							</div>
							<div
								role="progressbar"
								aria-label="Progreso del estudiante"
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={Math.round(pct)}
								className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
								<div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
							</div>
						</div>

						{enrollment.enrolled_at && (
							<div className="shrink-0 text-right">
								<p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
									<Clock aria-hidden="true" className="h-3 w-3" /> Inscripción
								</p>
								<p className="text-xs font-medium tabular-nums">{formatDate(enrollment.enrolled_at)}</p>
							</div>
						)}
					</div>
				</div>
			</div>
			<div className="border-t border-border bg-muted/20 px-4 py-2 text-center">
				<span className="text-xs font-medium text-primary">Ver detalles</span>
			</div>
		</button>
	);
}
