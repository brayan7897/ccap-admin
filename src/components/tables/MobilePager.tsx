"use client";

/** Prev/next for the card layout (the desktop DataTable brings its own pager). */
export function MobilePager({
	pageIndex,
	pageSize,
	total,
	onChange,
}: {
	pageIndex: number;
	pageSize: number;
	total: number;
	onChange: (pageIndex: number) => void;
}) {
	const pageCount = Math.max(1, Math.ceil(total / pageSize));
	if (total === 0) return null;

	const btn =
		"h-10 cursor-pointer rounded-md border border-border px-4 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

	return (
		<nav
			aria-label="Paginación"
			className="mt-4 flex items-center justify-between gap-2 text-sm text-muted-foreground">
			<button
				type="button"
				onClick={() => onChange(pageIndex - 1)}
				disabled={pageIndex === 0}
				className={btn}>
				Anterior
			</button>
			<span className="text-center tabular-nums" aria-live="polite">
				{pageIndex + 1} / {pageCount} · {total} en total
			</span>
			<button
				type="button"
				onClick={() => onChange(pageIndex + 1)}
				disabled={pageIndex + 1 >= pageCount}
				className={btn}>
				Siguiente
			</button>
		</nav>
	);
}
