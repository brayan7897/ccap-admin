"use client";

import type { ReactNode } from "react";
import { AlertTriangle, RotateCw, SearchX } from "lucide-react";

/** Error with a recovery path (retry), announced to screen readers. */
export function TableError({
	message,
	onRetry,
	isRetrying = false,
}: {
	message: string;
	onRetry: () => void;
	isRetrying?: boolean;
}) {
	return (
		<div
			role="alert"
			className="flex flex-col items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
			<AlertTriangle aria-hidden="true" className="h-6 w-6 text-destructive" />
			<div>
				<p className="text-sm font-medium text-foreground">{message}</p>
				<p className="mt-1 text-xs text-muted-foreground">
					Verifica tu conexión o que la API esté disponible e inténtalo de nuevo.
				</p>
			</div>
			<button
				type="button"
				onClick={onRetry}
				disabled={isRetrying}
				className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
				<RotateCw
					aria-hidden="true"
					className={isRetrying ? "h-4 w-4 animate-spin motion-reduce:animate-none" : "h-4 w-4"}
				/>
				Reintentar
			</button>
		</div>
	);
}

/** Empty state that explains why it is empty and offers the next action. */
export function TableEmpty({
	hasFilters,
	entity,
	onClearFilters,
	action,
}: {
	hasFilters: boolean;
	/** Plural noun, e.g. "certificados". */
	entity: string;
	onClearFilters: () => void;
	action?: ReactNode;
}) {
	return (
		<div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
			<SearchX aria-hidden="true" className="h-7 w-7 text-muted-foreground" />
			<div>
				<p className="text-sm font-medium text-foreground">
					{hasFilters ? `Sin ${entity} para esta búsqueda` : `Aún no hay ${entity}`}
				</p>
				<p className="mt-1 text-xs text-muted-foreground">
					{hasFilters
						? "Prueba con otro nombre, DNI o curso, o quita los filtros."
						: "Cuando existan, aparecerán aquí."}
				</p>
			</div>
			{hasFilters ? (
				<button
					type="button"
					onClick={onClearFilters}
					className="cursor-pointer rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
					Limpiar filtros
				</button>
			) : (
				action
			)}
		</div>
	);
}
