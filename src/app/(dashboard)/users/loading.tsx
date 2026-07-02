export default function UsersLoading() {
	return (
		<div className="space-y-6 p-1">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-2">
					<div className="h-7 w-28 rounded-md bg-muted animate-pulse" />
					<div className="h-4 w-64 rounded-md bg-muted animate-pulse" />
				</div>
				<div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
			</div>

			{/* Filter bar */}
			<div className="flex items-center gap-3">
				<div className="h-9 w-64 rounded-md bg-muted animate-pulse" />
				<div className="h-9 w-40 rounded-md bg-muted animate-pulse" />
			</div>

			{/* Table skeleton */}
			<div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
				{/* Table header */}
				<div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/30">
					{[120, 160, 140, 100, 80, 60].map((w, i) => (
						<div
							key={i}
							className="h-3 rounded bg-muted animate-pulse"
							style={{ width: `${w}px` }}
						/>
					))}
				</div>
				{/* Table rows */}
				{Array.from({ length: 8 }).map((_, i) => (
					<div
						key={i}
						className="flex items-center gap-4 px-4 py-4 border-b border-border last:border-0"
					>
						<div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
						<div className="h-3 w-32 rounded bg-muted animate-pulse" />
						<div className="h-3 w-40 rounded bg-muted animate-pulse" />
						<div className="h-3 w-24 rounded bg-muted animate-pulse" />
						<div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
						<div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
						<div className="ml-auto h-7 w-16 rounded bg-muted animate-pulse" />
					</div>
				))}
			</div>
		</div>
	);
}
