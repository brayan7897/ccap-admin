"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
	companyInfoSchema,
	type CompanyInfoInput,
	type CompanyInfoResponse,
} from "@/features/site/schemas/site.schema";
import { useUpdateCompanyInfo } from "@/features/site/hooks/useSite";

interface CompanyInfoFormProps {
	initialData?: CompanyInfoResponse;
}

export function CompanyInfoForm({ initialData }: CompanyInfoFormProps) {
	const updateCompanyInfo = useUpdateCompanyInfo();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CompanyInfoInput>({
		resolver: zodResolver(companyInfoSchema),
		defaultValues: {
			phone_number: initialData?.phone_number || "",
			email: initialData?.email || "",
			address: initialData?.address || "",
			facebook_url: initialData?.facebook_url || "",
			instagram_url: initialData?.instagram_url || "",
			twitter_url: initialData?.twitter_url || "",
			youtube_url: initialData?.youtube_url || "",
			linkedin_url: initialData?.linkedin_url || "",
			tiktok_url: initialData?.tiktok_url || "",
			website_url: initialData?.website_url || "",
		},
	});

	const onSubmit = async (data: CompanyInfoInput) => {
		try {
			await updateCompanyInfo.mutateAsync(data);
			toast.success("Información de la empresa actualizada correctamente");
		} catch (error) {
			toast.error("Error al actualizar la información");
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Contacto */}
				<div className="space-y-4 rounded-xl border p-4 bg-card">
					<h3 className="font-semibold text-lg border-b pb-2">Información de Contacto</h3>
					
					<div className="space-y-2">
						<label htmlFor="phone_number" className="text-sm font-medium">Teléfono</label>
						<input
							id="phone_number"
							{...register("phone_number")}
							className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
							placeholder="+51 999 999 999"
						/>
						{errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number.message}</p>}
					</div>

					<div className="space-y-2">
						<label htmlFor="email" className="text-sm font-medium">Correo Electrónico</label>
						<input
							id="email"
							type="email"
							{...register("email")}
							className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
							placeholder="contacto@ccap.edu.pe"
						/>
						{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
					</div>

					<div className="space-y-2">
						<label htmlFor="address" className="text-sm font-medium">Dirección</label>
						<textarea
							id="address"
							{...register("address")}
							className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary min-h-[80px]"
							placeholder="Av. Principal 123..."
						/>
						{errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
					</div>

					<div className="space-y-2">
						<label htmlFor="website_url" className="text-sm font-medium">Sitio Web Principal</label>
						<input
							id="website_url"
							{...register("website_url")}
							className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
							placeholder="https://www.ccap.edu.pe"
						/>
						{errors.website_url && <p className="text-xs text-destructive">{errors.website_url.message}</p>}
					</div>
				</div>

				{/* Redes Sociales */}
				<div className="space-y-4 rounded-xl border p-4 bg-card">
					<h3 className="font-semibold text-lg border-b pb-2">Redes Sociales</h3>
					
					{[
						{ id: "facebook_url", label: "Facebook URL" },
						{ id: "instagram_url", label: "Instagram URL" },
						{ id: "twitter_url", label: "Twitter (X) URL" },
						{ id: "youtube_url", label: "YouTube URL" },
						{ id: "linkedin_url", label: "LinkedIn URL" },
						{ id: "tiktok_url", label: "TikTok URL" },
					].map((social) => (
						<div key={social.id} className="space-y-2">
							<label htmlFor={social.id} className="text-sm font-medium">{social.label}</label>
							<input
								id={social.id}
								{...register(social.id as keyof CompanyInfoInput)}
								className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
								placeholder="https://..."
							/>
							{errors[social.id as keyof CompanyInfoInput] && (
								<p className="text-xs text-destructive">
									{errors[social.id as keyof CompanyInfoInput]?.message as string}
								</p>
							)}
						</div>
					))}
				</div>
			</div>

			<div className="flex justify-end pt-4">
				<button
					type="submit"
					disabled={updateCompanyInfo.isPending}
					className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
				>
					{updateCompanyInfo.isPending ? "Guardando..." : "Guardar Información"}
				</button>
			</div>
		</form>
	);
}
