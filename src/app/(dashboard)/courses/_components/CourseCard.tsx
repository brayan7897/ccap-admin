"use client";

import type { Course } from "@/types";
import { BookOpen, Pencil, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LEVEL_LABELS: Record<string, string> = {
	BASIC: "Básico",
	INTERMEDIATE: "Intermedio",
	ADVANCED: "Avanzado",
};

const STATUS_LABELS: Record<string, string> = {
	draft: "Borrador",
	published: "Publicado",
	archived: "Archivado",
};

const STATUS_CLASSES: Record<string, string> = {
	draft: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	archived: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

interface CourseCardProps {
	course: Course;
	enrolledCount: number | string;
	onDelete: (id: string) => void;
}

export function CourseCard({ course, enrolledCount, onDelete }: CourseCardProps) {
	const isPaid = course.course_type === "PAID";
	const levelLabel = LEVEL_LABELS[course.course_level] ?? course.course_level;

	return (
		<div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
			<div className="p-4 flex-1">
				<div className="flex justify-between items-start gap-4 mb-2">
					<Link
						href={`/courses/${course.id}`}
						className="font-semibold text-base leading-tight text-foreground hover:text-primary transition-colors line-clamp-2"
					>
						{course.title}
					</Link>
					
					{/* Status badges */}
					<div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
						<span
							className={cn(
								"inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
								STATUS_CLASSES[course.status]
							)}
						>
							{STATUS_LABELS[course.status]}
						</span>
						{course.featured && (
							<span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
								Destacado
							</span>
						)}
						{course.certificate_only && (
							<span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
								Solo certificado
							</span>
						)}
					</div>
				</div>

				<div className="flex flex-col gap-1.5 mt-3 mb-4 text-xs text-muted-foreground">
					<p className="flex items-center gap-1.5">
						<span className="font-medium text-foreground">Categoría:</span>
						{course.category?.name ?? course.category_name ?? "—"}
					</p>
					<p className="flex items-center gap-1.5">
						<span className="font-medium text-foreground">Instructor:</span>
						{course.instructor_name ?? course.instructor?.first_name ?? "—"}
					</p>
					<div className="flex flex-wrap items-center gap-2 mt-1">
						{/* Tipo */}
						<span
							className={cn(
								"inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
								isPaid
									? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
									: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
							)}
						>
							{isPaid ? `S/.${course.price ?? "?"}` : "Gratis"}
						</span>
						<span className="h-3 w-px bg-border"></span>
						{/* Nivel */}
						<span className="font-medium">{levelLabel}</span>
					</div>
				</div>

				<div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mt-auto">
					<div className="flex items-center gap-1.5" title="Módulos y Lecciones">
						<BookOpen className="h-3.5 w-3.5" />
						<span>{course.total_modules ?? course.modules?.length ?? 0} M, {course.total_lessons ?? 0} L</span>
					</div>
					<div className="flex items-center gap-1.5" title="Inscritos">
						<Users className="h-3.5 w-3.5" />
						<span>{enrolledCount}</span>
					</div>
				</div>
			</div>

			<div className="flex items-center gap-2 border-t border-border bg-muted/20 px-4 py-3">
				<Link
					href={`/courses/${course.id}`}
					className="flex-1 inline-flex justify-center items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors"
				>
					<Pencil className="h-4 w-4" />
					Editar
				</Link>
				<button
					onClick={() => onDelete(course.id)}
					className="inline-flex justify-center items-center gap-2 rounded-md bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/20 transition-colors"
				>
					<Trash2 className="h-4 w-4" />
					<span className="sr-only">Eliminar</span>
				</button>
			</div>
		</div>
	);
}
