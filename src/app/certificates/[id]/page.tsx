"use client";

import { useCertificate } from "@/features/certificates/hooks/useCertificates";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { useParams } from "next/navigation";

export default function CertificateDetailPage() {
	const { id } = useParams<{ id: string }>();
	const { data: cert, isLoading, isError } = useCertificate(id);

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
				<Loader2 className="h-8 w-8 animate-spin text-primary" />
				<p className="text-muted-foreground">Cargando certificado...</p>
			</div>
		);
	}

	if (isError || !cert) {
		return (
			<div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
				<AlertCircle className="h-16 w-16 text-destructive" />
				<h1 className="text-2xl font-bold text-foreground">
					Certificado no encontrado
				</h1>
				<p className="text-muted-foreground max-w-md">
					El certificado que estás buscando no existe o fue eliminado.
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
			<div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div>
					<h1 className="text-3xl font-bold text-foreground tracking-tight">
						Consultar Certificado
					</h1>
					<p className="text-muted-foreground mt-2">
						Emitido el {new Date(cert.issued_at).toLocaleDateString()}
					</p>
				</div>

				{cert.pdf_url && (
					<a
						href={cert.pdf_url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 shadow-sm">
						Descargar PDF
					</a>
				)}
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				<div className="rounded-xl border border-border bg-card p-5">
					<p className="text-sm font-medium text-muted-foreground mb-1">
						Código único
					</p>
					<p className="font-mono text-foreground">{cert.certificate_code}</p>
				</div>
				<div className="rounded-xl border border-border bg-card p-5">
					<p className="text-sm font-medium text-muted-foreground mb-1">
						Alumno
					</p>
					<p className="text-sm text-foreground break-all">{cert.user_full_name ?? cert.user_id}</p>
				</div>
				<div className="rounded-xl border border-border bg-card p-5">
					<p className="text-sm font-medium text-muted-foreground mb-1">
						Curso
					</p>
					<p className="text-sm text-foreground break-all">{cert.course_title ?? cert.course_id}</p>
				</div>
			</div>
		</div>
	);
}
