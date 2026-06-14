"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type {
	ActivityReportItem,
	CertificateReportItem,
	EnrollmentReportItem,
	EnrollmentStatus,
	StudentProgressReportItem,
	UserRegistrationReportItem,
} from "@/types";

const STATUS_BADGE: Record<EnrollmentStatus, { label: string; className: string }> = {
	ENROLLED: {
		label: "Matriculado",
		className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
	},
	ACTIVE: {
		label: "Activo",
		className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
	},
	COMPLETED: {
		label: "Completado",
		className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
	},
	CANCELLED: {
		label: "Cancelado",
		className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
	},
};

function formatDate(date: string | null) {
	if (!date) return "—";
	return new Date(date).toLocaleDateString("es-PE", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

function formatDateTime(date: string | null) {
	if (!date) return "—";
	return new Date(date).toLocaleString("es-PE", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function StatusBadge({ status }: { status: EnrollmentStatus }) {
	const badge = STATUS_BADGE[status] ?? STATUS_BADGE.ENROLLED;
	return (
		<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
			{badge.label}
		</span>
	);
}

function ActiveBadge({ isActive }: { isActive: boolean }) {
	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
				isActive
					? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
					: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
			}`}>
			{isActive ? "Activo" : "Inactivo"}
		</span>
	);
}

export function buildEnrollmentsReportColumns(): ColumnDef<EnrollmentReportItem, unknown>[] {
	return [
		{ accessorKey: "course_title", header: "Curso" },
		{
			accessorKey: "month",
			header: "Mes",
			cell: ({ row }) => row.original.month ?? "—",
		},
		{ accessorKey: "enrollments", header: "Matrículas" },
		{ accessorKey: "completions", header: "Completados" },
	];
}

export function buildStudentProgressReportColumns(): ColumnDef<StudentProgressReportItem, unknown>[] {
	return [
		{ accessorKey: "student_name", header: "Estudiante" },
		{
			accessorKey: "student_email",
			header: "Correo",
			meta: { className: "hidden lg:table-cell" },
		},
		{ accessorKey: "course_title", header: "Curso" },
		{
			accessorKey: "status",
			header: "Estado",
			cell: ({ row }) => <StatusBadge status={row.original.status} />,
		},
		{
			accessorKey: "progress_percentage",
			header: "Progreso",
			cell: ({ row }) => {
				const pct = row.original.progress_percentage ?? 0;
				return (
					<div className="flex items-center gap-2 min-w-20">
						<div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
							<div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
						</div>
						<span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
					</div>
				);
			},
		},
		{
			id: "lessons",
			header: "Lecciones",
			cell: ({ row }) => `${row.original.completed_lessons}/${row.original.total_lessons}`,
			meta: { className: "hidden md:table-cell" },
		},
		{
			accessorKey: "enrolled_at",
			header: "Matriculado el",
			cell: ({ row }) => formatDate(row.original.enrolled_at),
			meta: { className: "hidden xl:table-cell" },
		},
	];
}

export function buildCertificatesReportColumns(): ColumnDef<CertificateReportItem, unknown>[] {
	return [
		{ accessorKey: "certificate_code", header: "Código" },
		{ accessorKey: "student_name", header: "Estudiante" },
		{
			accessorKey: "student_email",
			header: "Correo",
			meta: { className: "hidden lg:table-cell" },
		},
		{ accessorKey: "course_title", header: "Curso" },
		{
			accessorKey: "issued_at",
			header: "Emitido el",
			cell: ({ row }) => formatDate(row.original.issued_at),
		},
		{
			accessorKey: "pdf_url",
			header: "PDF",
			cell: ({ row }) => {
				const url = row.original.pdf_url;
				if (!url) return <span className="text-muted-foreground text-xs">—</span>;
				return (
					<a
						href={url}
						target="_blank"
						rel="noopener noreferrer"
						className="text-primary hover:underline text-xs"
						onClick={(e) => e.stopPropagation()}>
						Ver PDF
					</a>
				);
			},
			meta: { className: "hidden md:table-cell" },
		},
	];
}

export function buildUsersRegistrationReportColumns(): ColumnDef<UserRegistrationReportItem, unknown>[] {
	return [
		{
			accessorKey: "month",
			header: "Mes",
			cell: ({ row }) => row.original.month ?? "—",
		},
		{ accessorKey: "role_name", header: "Rol" },
		{
			accessorKey: "is_active",
			header: "Estado",
			cell: ({ row }) => <ActiveBadge isActive={row.original.is_active} />,
		},
		{ accessorKey: "total", header: "Total" },
	];
}

export function buildActivityReportColumns(): ColumnDef<ActivityReportItem, unknown>[] {
	return [
		{ accessorKey: "full_name", header: "Nombre" },
		{
			accessorKey: "email",
			header: "Correo",
			meta: { className: "hidden lg:table-cell" },
		},
		{ accessorKey: "role_name", header: "Rol" },
		{
			accessorKey: "is_active",
			header: "Estado",
			cell: ({ row }) => <ActiveBadge isActive={row.original.is_active} />,
		},
		{
			accessorKey: "last_login_at",
			header: "Último acceso",
			cell: ({ row }) => formatDateTime(row.original.last_login_at),
		},
		{
			accessorKey: "total_sessions",
			header: "Sesiones",
			meta: { className: "hidden md:table-cell" },
		},
	];
}
