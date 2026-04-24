"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Course } from "@/types";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

const LEVEL_LABELS: Record<string, string> = {
	BASIC: "Básico",
	INTERMEDIATE: "Intermedio",
	ADVANCED: "Avanzado",
};

interface ActionsProps {
	course: Course;
	onDelete: (id: string) => void;
}

function Actions({ course, onDelete }: ActionsProps) {
	return (
		<div className="flex items-center gap-2">
			<Link
				href={`/courses/${course.id}`}
				className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
				title="Editar">
				<Pencil className="h-4 w-4" />
			</Link>
			<button
				onClick={() => onDelete(course.id)}
				className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
				title="Eliminar">
				<Trash2 className="h-4 w-4" />
			</button>
		</div>
	);
}

export function buildCoursesColumns(
	onDelete: (id: string) => void,
	enrolledCountMap: Record<string, number> = {},
): ColumnDef<Course, unknown>[] {
	return [
		{
			accessorKey: "title",
			header: "Título",
			cell: ({ row }) => (
				<Link
					href={`/courses/${row.original.id}`}
					className="font-medium text-foreground hover:text-primary hover:underline transition-colors">
					{row.original.title}
				</Link>
			),
		},
		{
			accessorKey: "category",
			header: "Categoría",
			cell: ({ row }) =>
				row.original.category?.name ?? row.original.category_name ?? "—",
		},
		{
			accessorKey: "instructor_name",
			header: "Instructor",
			cell: ({ row }) =>
				row.original.instructor_name ??
				row.original.instructor?.first_name ??
				"—",
		},
		{
			accessorKey: "course_level",
			header: "Nivel",
			cell: ({ row }) =>
				LEVEL_LABELS[row.original.course_level] ?? row.original.course_level,
		},
		{
			accessorKey: "is_published",
			header: "Estado",
			cell: ({ row }) => (
				<span
					className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
						row.original.is_published
							? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
							: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
					}`}>
					{row.original.is_published ? "Publicado" : "Borrador"}
				</span>
			),
		},
		{
			accessorKey: "course_type",
			header: "Tipo",
			cell: ({ row }) => {
				const isPaid = row.original.course_type === "PAID";
				return (
					<span
						className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
							isPaid
								? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
								: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
						}`}>
						{isPaid ? `PAGO S/.${row.original.price ?? "?"}` : "GRATIS"}
					</span>
				);
			},
		},
		{
			accessorKey: "total_modules",
			header: "Módulos",
			cell: ({ row }) =>
				row.original.total_modules ?? row.original.modules?.length ?? "—",
		},
		{
			accessorKey: "total_lessons",
			header: "Lecciones",
			cell: ({ row }) => row.original.total_lessons ?? "—",
		},
		{
			accessorKey: "enrolled_count",
			header: "Inscritos",
			cell: ({ row }) =>
				row.original.enrolled_count ?? enrolledCountMap[row.original.id] ?? "—",
		},
		{
			id: "actions",
			header: "Acciones",
			cell: ({ row }) => <Actions course={row.original} onDelete={onDelete} />,
		},
	];
}
