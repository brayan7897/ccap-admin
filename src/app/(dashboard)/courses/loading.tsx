export default function CoursesLoading() {
	return (
		<div className="space-y-6 p-1">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-2">
					<div className="h-7 w-20 rounded-md bg-muted animate-pulse" />
					<div className="h-4 w-56 rounded-md bg-muted animate-pulse" />
				</div>
				<div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
			</div>

			{/* Filter bar */}
			<div className="flex items-center gap-3">
				<div className="h-9 w-64 rounded-md bg-muted animate-pulse" />
				<div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
				<div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
			</div>

			{/* Cards grid skeleton */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, i) => (
					<div
						key={i}
						className="rounded-xl border border-border bg-card shadow-sm overflow-hidden"
					>
						{/* Image placeholder */}
						<div className="h-36 w-full bg-muted animate-pulse" />
						{/* Content */}
						<div className="p-4 space-y-3">
							<div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
							<div className="h-3 w-full rounded bg-muted animate-pulse" />
							<div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
							<div className="flex items-center gap-2 pt-1">
								<div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
								<div className="h-5 w-14 rounded-full bg-muted animate-pulse" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
