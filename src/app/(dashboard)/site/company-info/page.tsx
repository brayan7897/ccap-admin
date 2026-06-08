"use client";

import { useCompanyInfo } from "@/features/site/hooks/useSite";
import { CompanyInfoForm } from "./_components/CompanyInfoForm";

export default function CompanyInfoPage() {
	const { data, isLoading, isError } = useCompanyInfo();

	if (isLoading) {
		return <p className="text-sm text-muted-foreground">Cargando información de la empresa...</p>;
	}

	return (
		<div className="space-y-6 max-w-5xl">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Información de la Empresa</h2>
				<p className="text-sm text-muted-foreground">
					Gestiona los datos de contacto y redes sociales que se mostrarán en el sitio web principal.
				</p>
			</div>

			{isError ? (
				<div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
					Ocurrió un error al cargar la información. El servidor podría no estar disponible.
				</div>
			) : (
				<CompanyInfoForm initialData={data} />
			)}
		</div>
	);
}
