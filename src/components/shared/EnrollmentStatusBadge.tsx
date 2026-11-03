import { Ban, CheckCircle2, CircleDot, PlayCircle, type LucideIcon } from "lucide-react";
import type { EnrollmentStatus } from "@/types";
import { cn } from "@/lib/utils";

export const ENROLLMENT_STATUS: Record<
	EnrollmentStatus,
	{ label: string; className: string; Icon: LucideIcon }
> = {
	ENROLLED: {
		label: "Matriculado",
		className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
		Icon: CircleDot,
	},
	ACTIVE: {
		label: "Activo",
		className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
		Icon: PlayCircle,
	},
	COMPLETED: {
		label: "Completado",
		className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
		Icon: CheckCircle2,
	},
	CANCELLED: {
		label: "Cancelado",
		className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
		Icon: Ban,
	},
};

/** Status chip: color + icon + text, so meaning never relies on color alone. */
export function EnrollmentStatusBadge({
	status,
	className,
}: {
	status: EnrollmentStatus | undefined;
	className?: string;
}) {
	const cfg = ENROLLMENT_STATUS[status ?? "ENROLLED"] ?? ENROLLMENT_STATUS.ENROLLED;
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
				cfg.className,
				className,
			)}>
			<cfg.Icon aria-hidden="true" className="h-3 w-3" />
			{cfg.label}
		</span>
	);
}
