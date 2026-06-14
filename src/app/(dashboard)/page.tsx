"use client";

import {
	BookOpen,
	GraduationCap,
	TrendingUp,
	Users,
	Activity,
	PlayCircle,
	UserCheck,
	Clock,
	Award,
	BarChart3,
	PieChart,
	Star,
} from "lucide-react";
import {
	useDashboardStats,
	useDashboardCharts,
} from "@/features/dashboard/hooks/useDashboard";
import {
	Skeleton,
	KpiCardSkeleton,
	ChartSkeleton,
	ListSkeleton,
} from "@/components/ui/skeleton";
import type {
	MonthlyEnrollment,
	TopCourse,
	EnrollmentStatusItem,
	LevelDistribution,
	CategoryItem,
} from "@/features/dashboard/services/dashboard.service";

// ── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_LABEL: Record<string, string> = {
	BASIC: "Básico",
	INTERMEDIATE: "Intermedio",
	ADVANCED: "Avanzado",
};

const LEVEL_COLOR: Record<string, string> = {
	BASIC: "#22c55e",
	INTERMEDIATE: "#f59e0b",
	ADVANCED: "#ef4444",
};

const STATUS_LABEL: Record<string, string> = {
	ACTIVE: "Activos",
	COMPLETED: "Completados",
	CANCELLED: "Cancelados",
};

const STATUS_COLOR: Record<string, string> = {
	ACTIVE: "#22c55e",
	COMPLETED: "#3b82f6",
	CANCELLED: "#f87171",
};

// ── Mini Sparkline Bar Chart ──────────────────────────────────────────────────
function BarChart({
	data,
}: {
	data: { label: string; value: number; value2?: number }[];
}) {
	const max = Math.max(...data.map((d) => Math.max(d.value, d.value2 ?? 0)), 1);
	return (
		<div className="flex items-end gap-1 h-32 w-full">
			{data.map((d, i) => (
				<div
					key={i}
					className="flex-1 flex flex-col items-center gap-0.5 group relative">
					<div
						className="relative w-full flex items-end gap-0.5"
						style={{ height: "100px" }}>
						{/* Bar 1 */}
						<div
							className="flex-1 rounded-t-sm transition-all duration-300"
							style={{
								height: `${(d.value / max) * 100}%`,
								background:
									"hsl(var(--primary))",
								opacity: 0.85,
							}}
						/>
						{/* Bar 2 (optional) */}
						{d.value2 !== undefined && (
							<div
								className="flex-1 rounded-t-sm transition-all duration-300"
								style={{
									height: `${(d.value2 / max) * 100}%`,
									background: "#22c55e",
									opacity: 0.75,
								}}
							/>
						)}
					</div>
					<span className="text-[9px] text-muted-foreground truncate w-full text-center leading-none mt-1">
						{d.label}
					</span>
					{/* Tooltip */}
					<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover border border-border text-foreground text-[10px] rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none shadow-lg">
						{d.value2 !== undefined
							? `Inscritos: ${d.value} / Completados: ${d.value2}`
							: d.value}
					</div>
				</div>
			))}
		</div>
	);
}

// ── Pie / Donut Chart (SVG) ───────────────────────────────────────────────────
function DonutChart({
	data,
	size = 120,
}: {
	data: { label: string; value: number; color: string }[];
	size?: number;
}) {
	const total = data.reduce((s, d) => s + d.value, 0) || 1;
	const r = 40;
	const cx = size / 2;
	const cy = size / 2;
	const strokeWidth = 18;
	const circumference = 2 * Math.PI * r;

	let offset = 0;
	const segments = data.map((d) => {
		const pct = d.value / total;
		const dash = pct * circumference;
		const gap = circumference - dash;
		const seg = { ...d, dash, gap, offset };
		offset += dash;
		return seg;
	});

	return (
		<div className="flex flex-col items-center gap-4">
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				{/* Background ring */}
				<circle
					cx={cx}
					cy={cy}
					r={r}
					fill="none"
					stroke="hsl(var(--border))"
					strokeWidth={strokeWidth}
				/>
				{segments.map((seg, i) => (
					<circle
						key={i}
						cx={cx}
						cy={cy}
						r={r}
						fill="none"
						stroke={seg.color}
						strokeWidth={strokeWidth}
						strokeDasharray={`${seg.dash} ${seg.gap}`}
						strokeDashoffset={-seg.offset}
						transform={`rotate(-90 ${cx} ${cy})`}
						className="transition-all duration-500"
					/>
				))}
				{/* Center text */}
				<text
					x={cx}
					y={cy}
					textAnchor="middle"
					dominantBaseline="central"
					className="fill-foreground"
					fontSize="12"
					fontWeight="600">
					{total}
				</text>
			</svg>
			{/* Legend */}
			<div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
				{data.map((d) => (
					<div key={d.label} className="flex items-center gap-1">
						<span
							className="inline-block w-2.5 h-2.5 rounded-full"
							style={{ background: d.color }}
						/>
						<span className="text-[10px] text-muted-foreground">
							{d.label}{" "}
							<span className="font-semibold text-foreground">{d.value}</span>
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

// ── Horizontal Bar (single value) ─────────────────────────────────────────────
function HorizontalBar({
	label,
	value,
	max,
	color = "hsl(var(--primary))",
	suffix = "",
}: {
	label: string;
	value: number;
	max: number;
	color?: string;
	suffix?: string;
}) {
	const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
	return (
		<div className="flex items-center gap-3">
			<span
				className="text-xs text-muted-foreground truncate"
				style={{ minWidth: "6rem", maxWidth: "6rem" }}
				title={label}>
				{label.length > 18 ? label.slice(0, 17) + "…" : label}
			</span>
			<div className="flex-1 rounded-full bg-muted h-2 overflow-hidden">
				<div
					className="h-full rounded-full transition-all duration-700"
					style={{ width: `${pct}%`, background: color }}
				/>
			</div>
			<span className="text-xs font-semibold text-foreground w-8 text-right">
				{value}
				{suffix}
			</span>
		</div>
	);
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
	label,
	value,
	subtext,
	icon: Icon,
	color,
	bg,
	badge,
}: {
	label: string;
	value: string;
	subtext?: string;
	icon: React.ElementType;
	color: string;
	bg: string;
	badge?: string;
}) {
	return (
		<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
			<div className={`rounded-xl p-3.5 shrink-0 ${bg}`}>
				<Icon className={`h-5 w-5 ${color}`} />
			</div>
			<div className="flex flex-col gap-0.5 min-w-0">
				<p className="text-xs font-medium text-muted-foreground truncate">
					{label}
				</p>
				<p className="text-2xl font-bold text-foreground">{value}</p>
				{subtext && (
					<p className="text-[10px] text-muted-foreground/80 truncate">
						{subtext}
					</p>
				)}
			</div>
			{badge && (
				<span className="ml-auto shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
					{badge}
				</span>
			)}
		</div>
	);
}

// ── Section Card ──────────────────────────────────────────────────────────────
function Card({
	title,
	icon: Icon,
	children,
	className = "",
}: {
	title: string;
	icon: React.ElementType;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`rounded-xl border border-border bg-card shadow-sm ${className}`}>
			<div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
				<Icon className="h-4 w-4 text-primary" />
				<h3 className="text-sm font-semibold text-foreground">{title}</h3>
			</div>
			<div className="p-5">{children}</div>
		</div>
	);
}

// ── Top Courses Table ─────────────────────────────────────────────────────────
function TopCoursesTable({ courses }: { courses: TopCourse[] }) {
	if (!courses.length)
		return (
			<p className="text-xs text-muted-foreground text-center py-8">
				Sin datos
			</p>
		);
	const maxEnroll = Math.max(...courses.map((c) => c.total_enrollments), 1);
	return (
		<div className="space-y-3">
			{courses.map((c, i) => (
				<div key={c.course_id} className="flex flex-col gap-1">
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2 min-w-0">
							<span className="text-[10px] font-bold text-muted-foreground w-4 shrink-0">
								#{i + 1}
							</span>
							<span
								className="text-xs font-medium text-foreground truncate"
								title={c.title}>
								{c.title}
							</span>
						</div>
						<div className="flex items-center gap-2 shrink-0">
							<span
								className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
								style={{
									background:
										(LEVEL_COLOR[c.level] ?? "#6b7280") + "22",
									color: LEVEL_COLOR[c.level] ?? "#6b7280",
								}}>
								{LEVEL_LABEL[c.level] ?? c.level}
							</span>
							<span className="text-xs font-bold text-foreground">
								{c.total_enrollments}
							</span>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex-1 rounded-full bg-muted h-1.5 overflow-hidden">
							<div
								className="h-full rounded-full bg-primary transition-all duration-700"
								style={{
									width: `${(c.total_enrollments / maxEnroll) * 100}%`,
								}}
							/>
						</div>
						<span className="text-[10px] text-muted-foreground shrink-0">
							{c.avg_progress_pct}% avance
						</span>
					</div>
				</div>
			))}
		</div>
	);
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
	const { data: stats, isLoading: statsLoading, isError: statsError } = useDashboardStats();
	const { data: charts, isLoading: chartsLoading, isError: chartsError } = useDashboardCharts();

	const isLoading = statsLoading || chartsLoading;

	// ── KPI cards ─────────────────────────────────────────────────────────────
	const kpiCards = [
		{
			label: "Usuarios Activos",
			value: stats ? String(stats.users.active) : "—",
			subtext: stats
				? `${stats.users.total} totales · ${stats.users.inactive} inactivos`
				: "",
			icon: Users,
			color: "text-primary",
			bg: "bg-primary/10",
			badge: stats?.users.pending_course_access
				? `${stats.users.pending_course_access} pendientes`
				: undefined,
		},
		{
			label: "Cursos Publicados",
			value: stats ? String(stats.courses.published) : "—",
			subtext: stats
				? `${stats.courses.total} totales · ${stats.courses.draft} borradores`
				: "",
			icon: BookOpen,
			color: "text-secondary",
			bg: "bg-secondary/10",
		},
		{
			label: "Total Matrículas",
			value: stats ? String(stats.enrollments.total) : "—",
			subtext: stats
				? `${stats.enrollments.active} activas · ${stats.enrollments.completed} completadas`
				: "",
			icon: GraduationCap,
			color: "text-amber-500",
			bg: "bg-amber-100 dark:bg-amber-900/20",
		},
		{
			label: "Progreso Promedio",
			value: stats
				? `${Math.round(stats.enrollments.avg_progress_pct)}%`
				: "—",
			subtext: stats
				? `${stats.lessons.completed_events} lecciones completadas`
				: "",
			icon: TrendingUp,
			color: "text-green-600",
			bg: "bg-green-100 dark:bg-green-900/20",
		},
		{
			label: "Inscripciones Activas",
			value: stats ? String(stats.enrollments.active) : "—",
			subtext: stats
				? `${stats.enrollments.cancelled} canceladas`
				: "",
			icon: Activity,
			color: "text-blue-500",
			bg: "bg-blue-100 dark:bg-blue-900/20",
		},
		{
			label: "Lecciones Vistas",
			value: stats ? String(stats.lessons.completed_events) : "—",
			subtext: "eventos completados",
			icon: PlayCircle,
			color: "text-violet-500",
			bg: "bg-violet-100 dark:bg-violet-900/20",
		},
	];

	// ── Prepare chart data ────────────────────────────────────────────────────
	const monthlyBarData: { label: string; value: number; value2: number }[] =
		(charts?.monthly_enrollments ?? []).map((m: MonthlyEnrollment) => ({
			label: m.month ?? "",
			value: m.enrollments,
			value2: m.completions,
		}));

	const donutData = (charts?.enrollment_status ?? []).map(
		(s: EnrollmentStatusItem) => ({
			label: STATUS_LABEL[s.status] ?? s.status,
			value: s.count,
			color: STATUS_COLOR[s.status] ?? "#94a3b8",
		}),
	);

	const maxCategory = Math.max(
		...(charts?.categories ?? []).map((c: CategoryItem) => c.enrollments),
		1,
	);
	const maxLevel = Math.max(
		...(charts?.level_distribution ?? []).map((l: LevelDistribution) => l.count),
		1,
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-1">
				<h2 className="text-2xl font-bold tracking-tight text-foreground">
					Dashboard
				</h2>
				<p className="text-sm text-muted-foreground">
					Resumen de la plataforma CCAP GLOBAL S.R.L.
				</p>
			</div>

			{/* Error stats */}
			{statsError && (
				<div className="rounded-md bg-destructive/15 p-4">
					<p className="text-sm text-destructive font-medium">
						No se pudieron cargar las métricas. Verifica tu conexión o
						recarga.
					</p>
				</div>
			)}
			{chartsError && (
				<div className="rounded-md bg-amber-50 border border-amber-200 p-3 dark:bg-amber-900/20 dark:border-amber-800">
					<p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
						⚠ Los datos de gráficos no están disponibles. Los KPIs siguen siendo válidos.
					</p>
				</div>
			)}

			{/* KPI Grid — 3 col on md, 6 on xl */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
				{isLoading
					? Array.from({ length: 6 }).map((_, i) => <KpiCardSkeleton key={i} />)
					: kpiCards.map((card) => <KpiCard key={card.label} {...card} />)}
			</div>

			{/* Row 1: Bar chart + Donut */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				{/* Monthly enrollments bar chart */}
				<Card
					title="Matrículas por mes (últimos 6 meses)"
					icon={BarChart3}
					className="lg:col-span-2">
					{chartsLoading ? (
						<ChartSkeleton />
					) : monthlyBarData.length === 0 ? (
						<div className="flex items-center justify-center h-36 text-muted-foreground text-sm">
							Sin datos de matrículas
						</div>
					) : (
						<>
							<div className="flex items-center gap-4 mb-3 text-[10px] text-muted-foreground">
								<span className="flex items-center gap-1">
									<span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block opacity-85" />
									Inscritos
								</span>
								<span className="flex items-center gap-1">
									<span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block opacity-75" />
									Completados
								</span>
							</div>
							<BarChart data={monthlyBarData} />
						</>
					)}
				</Card>

				{/* Enrollment status donut */}
				<Card title="Estado de matrículas" icon={PieChart}>
					{chartsLoading ? (
						<div className="flex items-center justify-center pt-2">
							<Skeleton className="h-32.5 w-32.5 rounded-full" />
						</div>
					) : donutData.length === 0 ? (
						<div className="flex items-center justify-center h-36 text-muted-foreground text-sm">
							Sin datos
						</div>
					) : (
						<div className="flex items-center justify-center pt-2">
							<DonutChart data={donutData} size={130} />
						</div>
					)}
				</Card>
			</div>

			{/* Row 2: Top cursos + Categorías + Niveles */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				{/* Top 5 cursos */}
				<Card
					title="Top 5 cursos por matrículas"
					icon={Star}
					className="lg:col-span-1">
					{chartsLoading ? (
						<ListSkeleton rows={5} />
					) : (
						<TopCoursesTable courses={charts?.top_courses ?? []} />
					)}
				</Card>

				{/* Categorías */}
				<Card title="Matrículas por categoría" icon={Award}>
					{chartsLoading ? (
						<ListSkeleton rows={4} />
					) : (charts?.categories ?? []).length === 0 ? (
						<p className="text-xs text-muted-foreground text-center py-8">
							Sin categorías
						</p>
					) : (
						<div className="space-y-3">
							{(charts?.categories ?? []).map((cat: CategoryItem) => (
								<HorizontalBar
									key={cat.name}
									label={cat.name}
									value={cat.enrollments}
									max={maxCategory}
									color="hsl(var(--primary))"
								/>
							))}
						</div>
					)}
				</Card>

				{/* Distribución por nivel */}
				<Card title="Cursos por nivel" icon={UserCheck}>
					{chartsLoading ? (
						<ListSkeleton rows={3} />
					) : (charts?.level_distribution ?? []).length === 0 ? (
						<p className="text-xs text-muted-foreground text-center py-8">
							Sin datos
						</p>
					) : (
						<div className="space-y-4">
							{(charts?.level_distribution ?? []).map(
								(lvl: LevelDistribution) => (
									<HorizontalBar
										key={lvl.level}
										label={LEVEL_LABEL[lvl.level] ?? lvl.level}
										value={lvl.count}
										max={maxLevel}
										color={LEVEL_COLOR[lvl.level] ?? "#6b7280"}
									/>
								),
							)}
							{/* % breakdown */}
							<div className="mt-2 grid grid-cols-3 gap-2 pt-2 border-t border-border">
								{(charts?.level_distribution ?? []).map(
									(lvl: LevelDistribution) => {
										const total = (charts?.level_distribution ?? []).reduce(
											(s: number, l: LevelDistribution) => s + l.count,
											0,
										);
										const pct =
											total > 0
												? Math.round((lvl.count / total) * 100)
												: 0;
										return (
											<div
												key={lvl.level}
												className="flex flex-col items-center">
												<span
													className="text-base font-bold"
													style={{
														color: LEVEL_COLOR[lvl.level] ?? "#6b7280",
													}}>
													{pct}%
												</span>
												<span className="text-[10px] text-muted-foreground">
													{LEVEL_LABEL[lvl.level] ?? lvl.level}
												</span>
											</div>
										);
									},
								)}
							</div>
						</div>
					)}
				</Card>
			</div>

			{/* Row 3: Enrollment completion rate */}
			{stats && (
				<Card title="Resumen de inscripciones" icon={GraduationCap}>
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
						{[
							{
								label: "Total",
								value: stats.enrollments.total,
								color: "#6366f1",
							},
							{
								label: "Activas",
								value: stats.enrollments.active,
								color: "#22c55e",
							},
							{
								label: "Completadas",
								value: stats.enrollments.completed,
								color: "#3b82f6",
							},
							{
								label: "Canceladas",
								value: stats.enrollments.cancelled,
								color: "#f87171",
							},
						].map((item) => {
							const pct =
								stats.enrollments.total > 0
									? Math.round(
											(item.value / stats.enrollments.total) * 100,
										)
									: 0;
							return (
								<div
									key={item.label}
									className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/40">
									<span
										className="text-3xl font-bold"
										style={{ color: item.color }}>
										{item.value}
									</span>
									<span className="text-xs text-muted-foreground">
										{item.label}
									</span>
									<div className="w-full rounded-full bg-muted h-1.5">
										<div
											className="h-full rounded-full transition-all duration-700"
											style={{
												width: `${pct}%`,
												background: item.color,
											}}
										/>
									</div>
									<span className="text-[10px] text-muted-foreground">
										{pct}% del total
									</span>
								</div>
							);
						})}
					</div>
				</Card>
			)}
		</div>
	);
}
