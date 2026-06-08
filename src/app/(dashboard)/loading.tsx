export default function DashboardLoading() {
	return (
		<div className="space-y-6 p-1">
			{/* Header Skeleton */}
			<div className="flex flex-col gap-2">
				<div className="h-8 w-48 rounded-md bg-muted animate-pulse"></div>
				<div className="h-4 w-72 rounded-md bg-muted animate-pulse"></div>
			</div>

			{/* KPI Grid Skeleton */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
						<div className="h-12 w-12 rounded-xl bg-muted animate-pulse shrink-0"></div>
						<div className="flex flex-col gap-2 flex-1">
							<div className="h-3 w-20 rounded bg-muted animate-pulse"></div>
							<div className="h-6 w-16 rounded bg-muted animate-pulse"></div>
						</div>
					</div>
				))}
			</div>

			{/* Main Content Areas Skeleton */}
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<div className="lg:col-span-2 h-[350px] rounded-xl border border-border bg-card shadow-sm flex flex-col p-5">
					<div className="h-5 w-40 rounded bg-muted animate-pulse mb-6"></div>
					<div className="flex-1 rounded-md bg-muted/50 animate-pulse"></div>
				</div>
				<div className="lg:col-span-1 h-[350px] rounded-xl border border-border bg-card shadow-sm flex flex-col p-5">
					<div className="h-5 w-32 rounded bg-muted animate-pulse mb-6"></div>
					<div className="flex-1 rounded-md bg-muted/50 animate-pulse"></div>
				</div>
			</div>

			{/* Table Area Skeleton */}
			<div className="h-[400px] rounded-xl border border-border bg-card shadow-sm flex flex-col p-5">
				<div className="h-5 w-48 rounded bg-muted animate-pulse mb-6"></div>
				<div className="space-y-4">
					{Array.from({ length: 5 }).map((_, i) => (
						<div
							key={i}
							className="h-12 w-full rounded bg-muted/50 animate-pulse"></div>
					))}
				</div>
			</div>
		</div>
	);
}
