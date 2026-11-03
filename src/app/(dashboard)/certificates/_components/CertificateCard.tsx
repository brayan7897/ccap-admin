"use client";

import type { Certificate } from "@/types";
import { Award, User } from "lucide-react";
import { courseName, formatDate, studentName } from "@/lib/display";

interface CertificateCardProps {
	certificate: Certificate;
	onClick: () => void;
}

export function CertificateCard({ certificate, onClick }: CertificateCardProps) {
	const student = studentName(certificate);
	const course = courseName(certificate);

	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={`Ver certificado de ${student}`}
			className="flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
			<div className="flex-1 p-4">
				<div className="mb-3 flex items-center gap-2">
					<Award aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
					<h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
						{course}
					</h3>
				</div>

				<div className="mt-2 space-y-2">
					<div className="flex items-center gap-2">
						<User aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />
						<p className="line-clamp-1 text-sm text-muted-foreground">{student}</p>
					</div>

					<div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
						<span className="truncate rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
							{certificate.certificate_code}
						</span>
						<span className="shrink-0 text-xs tabular-nums text-muted-foreground">
							{formatDate(certificate.issued_at)}
						</span>
					</div>
				</div>
			</div>
			<div className="border-t border-border bg-muted/20 px-4 py-2 text-center">
				<span className="text-xs font-medium text-primary">Ver detalles</span>
			</div>
		</button>
	);
}
