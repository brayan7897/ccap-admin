export default function EnrollmentsLoading() {
	return (
		<div className="space-y-6 p-1">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-2">
					<div className="h-7 w-28 rounded-md bg-muted animate-pulse" />
					<div className="h-4 w-60 rounded-md bg-muted animate-pulse" />
				</div>
				<div className="h-9 w-36 rounded-md bg-muted animate-pulse" />
			</div>

			{/* Filter bar */}
			<div className="flex items-center gap-3">
				<div className="h-9 w-64 rounded-md bg-muted animate-pulse" />
				<div className="h-9 w-40 rounded-md bg-muted animate-pulse" />
			</div>

			{/* Table skeleton */}
			<div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
				{/* Header */}
				<div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-muted/30">
					{[140, 160, 120, 100, 80].map((w, i) => (
						<div
							key={i}
							className="h-3 rounded bg-muted animate-pulse"
							style={{ width: `${w}px` }}
						/>
					))}
				</div>
				{/* Rows */}
				{Array.from({ length: 10 }).map((_, i) => (
					<div
						key={i}
						className="flex items-center gap-4 px-4 py-3.5 border-b border-border last:border-0"
					>
						<div className="h-3 w-36 rounded bg-muted animate-pulse" />
						<div className="h-3 w-40 rounded bg-muted animate-pulse" />
						<div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
						<div className="h-3 w-24 rounded bg-muted animate-pulse" />
						<div className="ml-auto flex gap-2">
							<div className="h-7 w-20 rounded bg-muted animate-pulse" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
