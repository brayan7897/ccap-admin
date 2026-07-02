export default function RolesLoading() {
	return (
		<div className="space-y-6 p-1">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex flex-col gap-2">
					<div className="h-7 w-36 rounded-md bg-muted animate-pulse" />
					<div className="h-4 w-56 rounded-md bg-muted animate-pulse" />
				</div>
				<div className="h-9 w-28 rounded-md bg-muted animate-pulse" />
			</div>

			{/* Two-column layout: roles + permissions */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Roles card */}
				<div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
					<div className="h-5 w-16 rounded bg-muted animate-pulse" />
					{Array.from({ length: 5 }).map((_, i) => (
						<div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
							<div className="h-8 w-8 rounded-lg bg-muted animate-pulse shrink-0" />
							<div className="flex-1 space-y-1">
								<div className="h-3 w-24 rounded bg-muted animate-pulse" />
								<div className="h-2.5 w-40 rounded bg-muted animate-pulse" />
							</div>
							<div className="h-7 w-16 rounded bg-muted animate-pulse" />
						</div>
					))}
				</div>

				{/* Permissions card */}
				<div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4">
					<div className="h-5 w-24 rounded bg-muted animate-pulse" />
					{Array.from({ length: 7 }).map((_, i) => (
						<div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
							<div className="h-3 w-40 rounded bg-muted animate-pulse" />
							<div className="ml-auto h-5 w-16 rounded-full bg-muted animate-pulse" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
