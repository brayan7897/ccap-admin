"use client";

import {
	BookOpen,
	GraduationCap,
	TrendingUp,
	Users,
	Activity,
	PlayCircle,
	Loader2,
} from "lucide-react";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboard";

export default function DashboardPage() {
	const { data: stats, isLoading, isError } = useDashboardStats();

	const kpiCards = [
		{
			label: "Usuarios Activos",
			value: stats ? String(stats.users.active) : "—",
			subtext: stats ? `${stats.users.total} totales` : "",
			icon: Users,
			color: "text-primary",
			bg: "bg-primary/10",
		},
		{
			label: "Cursos Publicados",
			value: stats ? String(stats.courses.published) : "—",
			subtext: stats ? `${stats.courses.total} totales` : "",
			icon: BookOpen,
			color: "text-secondary",
			bg: "bg-secondary/10",
		},
		{
			label: "Inscripciones Activas",
			value: stats ? String(stats.enrollments.active) : "—",
			subtext: stats ? `${stats.enrollments.completed} completadas` : "",
			icon: GraduationCap,
			color: "text-gold",
			bg: "bg-gold/10",
		},
		{
			label: "Progreso Promedio",
			value: stats ? `${Math.round(stats.enrollments.avg_progress_pct)}%` : "—",
			subtext: stats
				? `${stats.lessons.completed_events} lecciones vistas`
				: "",
			icon: Activity,
			color: "text-green-600",
			bg: "bg-green-100 dark:bg-green-900/20",
		},
	];

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-2">
				<h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
				<p className="text-sm text-muted-foreground">
					Resumen de la plataforma CCAP GLOBAL S.R.L.
				</p>
			</div>

			{isError && (
				<div className="rounded-md bg-destructive/15 p-4">
					<p className="text-sm text-destructive font-medium">
						No se pudieron cargar las métricas del dashboard. Verifica tu
						conexión o intenta recargar.
					</p>
				</div>
			)}

			{isLoading && (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" />
					Cargando métricas...
				</div>
			)}

			{/* KPI grid */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{kpiCards.map(({ label, value, subtext, icon: Icon, color, bg }) => (
					<div
						key={label}
						className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
						<div className={`rounded-xl p-3.5 ${bg}`}>
							<Icon className={`h-6 w-6 ${color}`} />
						</div>
						<div className="flex flex-col gap-0.5">
							<p className="text-xs font-medium text-muted-foreground">
								{label}
							</p>
							<p className="text-2xl font-bold text-foreground">{value}</p>
							{subtext && (
								<p className="text-[10px] text-muted-foreground/80">
									{subtext}
								</p>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Detailed info or charts placeholder */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-center min-h-64">
					<div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
						<Activity className="h-8 w-8 opacity-20" />
						<p className="text-sm">El gráfico de actividad llegará pronto.</p>
					</div>
				</div>
				<div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-center justify-center min-h-64">
					<div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
						<PlayCircle className="h-8 w-8 opacity-20" />
						<p className="text-sm">
							Las métricas detalladas de lecciones llegarán pronto.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
