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

/** Formatea una fecha ISO a día/mes/año en locale es-PE */
function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface ActionsProps {
	course: Course;
	onDelete: (id: string) => void;
}

function Actions({ course, onDelete }: ActionsProps) {
	return (
		<div className="flex items-center gap-2">
			<Link
				href={`/courses/${course.id}`}
				aria-label={`Editar curso ${course.title}`}
				className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				title="Editar">
				<Pencil className="h-4 w-4" />
			</Link>
			<button
				type="button"
				onClick={() => {
					if (
						window.confirm(
							`¿Eliminar el curso "${course.title}"? Esta acción no se puede deshacer.`,
						)
					) {
						onDelete(course.id);
					}
				}}
				aria-label={`Eliminar curso ${course.title}`}
				className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				title="Eliminar">
				<Trash2 className="h-4 w-4" />
			</button>
		</div>
	);
}

export function buildCoursesColumns(
	onDelete: (id: string) => void,
): ColumnDef<Course, unknown>[] {
	return [
		{
			accessorKey: "title",
			header: "Título",
			cell: ({ row }) => (
				<Link
					href={`/courses/${row.original.id}`}
					title={row.original.title}
					className="line-clamp-2 font-medium text-foreground hover:text-primary hover:underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
					{row.original.title}
				</Link>
			),
		},
		{
			accessorKey: "category",
			header: "Categoría",
			enableSorting: false,
			cell: ({ row }) =>
				row.original.category?.name ?? row.original.category_name ?? "—",
			meta: { className: "hidden lg:table-cell" },
		},
		{
			accessorKey: "instructor_name",
			header: "Instructor",
			enableSorting: false,
			cell: ({ row }) =>
				row.original.instructor_name ??
				row.original.instructor?.first_name ??
				"—",
			meta: { className: "hidden xl:table-cell" },
		},
		{
			accessorKey: "course_level",
			header: "Nivel",
			cell: ({ row }) =>
				LEVEL_LABELS[row.original.course_level] ?? row.original.course_level,
			meta: { className: "hidden lg:table-cell" },
		},
		{
			accessorKey: "status",
			header: "Estado",
			cell: ({ row }) => (
				<div className="flex flex-wrap items-center gap-1">
					<span
						className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[row.original.status]}`}>
						{STATUS_LABELS[row.original.status]}
					</span>
					{row.original.featured && (
						<span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
							Destacado
						</span>
					)}
					{row.original.certificate_only && (
						<span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
							Solo certificado
						</span>
					)}
				</div>
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
			enableSorting: false,
			cell: ({ row }) =>
				row.original.total_modules ?? row.original.modules?.length ?? "—",
			meta: { className: "hidden xl:table-cell" },
		},
		{
			accessorKey: "total_lessons",
			header: "Lecciones",
			enableSorting: false,
			cell: ({ row }) => row.original.total_lessons ?? "—",
			meta: { className: "hidden xl:table-cell" },
		},
		{
			accessorKey: "enrolled_count",
			header: "Inscritos",
			enableSorting: false,
			cell: ({ row }) => (
				<span className="tabular-nums">{row.original.enrolled_count ?? "—"}</span>
			),
			meta: { className: "hidden lg:table-cell" },
		},
		{
			accessorKey: "created_at",
			header: "Creado",
			cell: ({ row }) => (
				<span className="text-xs text-muted-foreground whitespace-nowrap">
					{formatDate(row.original.created_at)}
				</span>
			),
			meta: { className: "hidden 2xl:table-cell" },
		},
		{
			id: "actions",
			header: () => <span className="sr-only">Acciones</span>,
			enableSorting: false,
			cell: ({ row }) => <Actions course={row.original} onDelete={onDelete} />,
		},
	];
}
