"use client";

import type { Role } from "@/types";
import { Shield, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleCardProps {
	role: Role;
	onClick: () => void;
}

export function RoleCard({ role, onClick }: RoleCardProps) {
	return (
		<div
			onClick={onClick}
			className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
		>
			<div className="p-4 flex-1 flex flex-col justify-center">
				<div className="flex items-start justify-between gap-4 mb-2">
					<div className="flex items-center gap-2">
						{role.is_system_role ? (
							<Lock className="h-4 w-4 text-primary" />
						) : (
							<Shield className="h-4 w-4 text-muted-foreground" />
						)}
						<h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-1">
							{role.name}
						</h3>
					</div>
					{role.is_system_role && (
						<span className="shrink-0 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
							Sistema
						</span>
					)}
				</div>
				<p className="text-xs text-muted-foreground mt-2">
					{role.permission_count ?? 0} permisos asignados
				</p>
			</div>
			<div className="border-t border-border bg-muted/20 px-4 py-2 text-center">
				<span className="text-xs font-medium text-primary">Ver opciones</span>
			</div>
		</div>
	);
}
