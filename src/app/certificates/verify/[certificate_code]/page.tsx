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
	const [cert, setCert] = useState<Certificate | null>(null);

	useEffect(() => {
		if (code) {
			verifyMutation.mutate(code, {
				onSuccess: (data) => setCert(data),
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

	if (verifyMutation.isError || !cert) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
				<XCircle className="h-16 w-16 text-destructive" />
				<h1 className="text-2xl font-bold text-foreground">
					Certificado no válido
				</h1>
				<p className="text-muted-foreground max-w-md">
					No pudimos encontrar un certificado con el código provisto. Por favor,
					verifica que el enlace sea correcto o contacta a soporte.
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
					Certificado Verificado
				</h1>
				<p className="text-muted-foreground">
					Este certificado fue emitido el{" "}
					{new Date(cert.issued_at).toLocaleDateString()}
				</p>
				<div className="inline-block rounded-full bg-muted mt-2 px-4 py-1.5 text-sm font-medium text-foreground">
					Código: <span className="font-mono">{cert.certificate_code}</span>
				</div>
			</div>

			<div className="grid gap-8 md:grid-cols-3">
				{/* Certificate Display Area */}
				<div className="md:col-span-2 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
					{cert.html_content ? (
						<div
							className="w-full relative bg-white"
							style={{ aspectRatio: "1.414/1" }}>
							<iframe
								title="Certificado"
								srcDoc={cert.html_content}
								className="absolute inset-0 w-full h-full border-0"
							/>
						</div>
					) : (
						<div className="flex aspect-[1.414/1] w-full items-center justify-center bg-muted/30">
							<p className="text-sm text-muted-foreground">
								Vista previa del certificado no disponible.
							</p>
						</div>
					)}
				</div>

				{/* Info Sidebar */}
				<div className="space-y-6">
					<div className="rounded-xl border border-border bg-card p-6 shadow-sm">
						<h3 className="mb-4 text-lg font-semibold text-foreground">
							Detalles
						</h3>
						<dl className="space-y-4 text-sm">
							<div>
								<dt className="text-muted-foreground">ID de Usuario</dt>
								<dd className="font-medium text-foreground break-all">
									{cert.user_id}
								</dd>
							</div>
							<div>
								<dt className="text-muted-foreground">ID de Curso</dt>
								<dd className="font-medium text-foreground break-all">
									{cert.course_id}
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
			</div>
		</div>
	);
}
