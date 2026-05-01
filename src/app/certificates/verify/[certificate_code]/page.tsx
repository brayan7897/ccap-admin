"use client";

import { useVerifyCertificate } from "@/features/certificates/hooks/useCertificates";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Certificate } from "@/types";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useParams } from "next/navigation";

export default function VerifyCertificatePage() {
	const { certificate_code: code } = useParams<{ certificate_code: string }>();
	const verifyMutation = useVerifyCertificate();
	const [certs, setCerts] = useState<Certificate[] | null>(null);

	useEffect(() => {
		if (code) {
			verifyMutation.mutate(code, {
				onSuccess: (data) => setCerts(data),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [code]);

	if (verifyMutation.isPending) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="text-muted-foreground">Verificando certificado...</p>
			</div>
		);
	}

	if (verifyMutation.isError || !certs || certs.length === 0) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
				<XCircle className="h-16 w-16 text-destructive" />
				<h1 className="text-2xl font-bold text-foreground">
					Certificado no encontrado
				</h1>
				<p className="text-muted-foreground max-w-md">
					No pudimos encontrar ningún certificado con el código o DNI provisto.
					Verifica que el enlace sea correcto o contacta a soporte.
				</p>
				<Link
					href="/"
					className="mt-6 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
					Volver al inicio
				</Link>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-4xl py-12 px-4">
			<div className="mb-8 flex flex-col items-center space-y-4 text-center">
				<CheckCircle2 className="h-16 w-16 text-green-500" />
				<h1 className="text-3xl font-bold bg-linear-to-r from-primary to-blue-600 bg-clip-text text-transparent">
					{certs.length === 1 ? "Certificado Verificado" : "Certificados Verificados"}
				</h1>
				<p className="text-muted-foreground">
					{certs.length === 1
						? "Hemos validado la autenticidad del siguiente certificado."
						: `Hemos encontrado ${certs.length} certificados asociados.`}
				</p>
			</div>

			<div className="space-y-8">
				{certs.map((cert) => (
					<div key={cert.id} className="mx-auto max-w-2xl space-y-4">
						<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-semibold text-foreground">
									Detalles del Certificado
								</h3>
								<div className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
									Código: <span className="font-mono">{cert.certificate_code}</span>
								</div>
							</div>
							
							<dl className="space-y-4 text-sm">
								<div>
									<dt className="text-muted-foreground">Emitido el</dt>
									<dd className="font-medium text-foreground">
										{new Date(cert.issued_at).toLocaleDateString()}
									</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Alumno</dt>
									<dd className="font-medium text-foreground break-all">
										{cert.user_full_name ?? cert.user_id}
									</dd>
								</div>
								<div>
									<dt className="text-muted-foreground">Curso</dt>
									<dd className="font-medium text-foreground break-all">
										{cert.course_title ?? cert.course_id}
									</dd>
								</div>
							</dl>
						</div>

						{cert.pdf_url && (
							<a
								href={cert.pdf_url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm hover:shadow-md">
								Descargar PDF Original
							</a>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
