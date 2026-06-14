import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("animate-pulse rounded-md bg-muted", className)}
			{...props}
		/>
	);
}

// ── KPI card skeleton — mirrors KpiCard layout on the dashboard ────────────────
export function KpiCardSkeleton() {
	return (
		<div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
			<Skeleton className="h-12 w-12 rounded-xl shrink-0" />
			<div className="flex flex-col gap-2 min-w-0 flex-1">
				<Skeleton className="h-3 w-20" />
				<Skeleton className="h-6 w-14" />
				<Skeleton className="h-2.5 w-28" />
			</div>
		</div>
	);
}

// ── Chart/card body skeleton — generic placeholder for graphs and lists ────────
export function ChartSkeleton({ className = "h-36" }: { className?: string }) {
	return (
		<div className={cn("flex items-end gap-2", className)}>
			{Array.from({ length: 8 }).map((_, i) => (
				<Skeleton
					key={i}
					className="flex-1 rounded-t-sm rounded-b-none"
					style={{ height: `${30 + ((i * 17) % 70)}%` }}
				/>
			))}
		</div>
	);
}

// ── Table skeleton — header + N row placeholders ────────────────────────────────
export function TableSkeleton({
	rows = 6,
	columns = 4,
}: {
	rows?: number;
	columns?: number;
}) {
	return (
		<div className="space-y-3">
			<div className="flex gap-4">
				{Array.from({ length: columns }).map((_, i) => (
					<Skeleton key={i} className="h-3 flex-1" />
				))}
			</div>
			{Array.from({ length: rows }).map((_, r) => (
				<div key={r} className="flex gap-4 items-center">
					{Array.from({ length: columns }).map((_, c) => (
						<Skeleton key={c} className="h-8 flex-1" />
					))}
				</div>
			))}
		</div>
	);
}

// ── List row skeleton — for compact lists (top courses, categories, etc.) ───────
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
	return (
		<div className="space-y-3">
			{Array.from({ length: rows }).map((_, i) => (
				<div key={i} className="flex items-center gap-3">
					<Skeleton className="h-8 w-8 rounded-md shrink-0" />
					<div className="flex-1 space-y-1.5">
						<Skeleton className="h-3 w-3/4" />
						<Skeleton className="h-2 w-1/2" />
					</div>
				</div>
			))}
		</div>
	);
}
