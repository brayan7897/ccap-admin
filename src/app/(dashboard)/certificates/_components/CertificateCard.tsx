"use client";

import type { Certificate } from "@/types";
import { Award, User, BookOpen } from "lucide-react";

interface CertificateCardProps {
	certificate: Certificate;
	userMap: Record<string, string>;
	courseMap: Record<string, string>;
	onClick: () => void;
}

export function CertificateCard({ certificate, userMap, courseMap, onClick }: CertificateCardProps) {
	const studentName = userMap[certificate.user_id] ?? certificate.user_id;
	const courseName = courseMap[certificate.course_id] ?? certificate.course_id;

	return (
		<div
			onClick={onClick}
			className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer active:scale-[0.98]"
		>
			<div className="p-4 flex-1">
				<div className="flex items-center gap-2 mb-3">
					<Award className="h-5 w-5 text-primary shrink-0" />
					<h3 className="font-semibold text-sm leading-tight text-foreground line-clamp-2">
						{courseName}
					</h3>
				</div>
				
				<div className="space-y-2 mt-2">
					<div className="flex items-center gap-2">
						<User className="h-4 w-4 text-muted-foreground shrink-0" />
						<p className="text-xs text-muted-foreground line-clamp-1">{studentName}</p>
					</div>
					
					<div className="flex justify-between items-center pt-2 border-t border-border mt-2">
						<span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
							{certificate.certificate_code}
						</span>
						<span className="text-[10px] text-muted-foreground">
							{new Date(certificate.issued_at).toLocaleDateString("es-PE", {
								day: "2-digit",
								month: "short",
								year: "numeric"
							})}
						</span>
					</div>
				</div>
			</div>
			<div className="border-t border-border bg-muted/20 px-4 py-2 text-center">
				<span className="text-xs font-medium text-primary">Ver detalles</span>
			</div>
		</div>
	);
}
