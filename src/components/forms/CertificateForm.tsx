"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import {
	certificateCreateSchema,
	certificateEditSchema,
	type CertificateCreateInput,
	type CertificateEditInput,
} from "@/features/certificates/schemas/certificate.schema";
import type { Certificate, User, Course } from "@/types";
import { Link as LinkIcon, Code } from "lucide-react";
import { UserCombobox } from "@/components/shared/UserCombobox";
import { CourseCombobox } from "@/components/shared/CourseCombobox";

interface CertificateFormProps {
	mode: "create" | "edit";
	defaultValues?: Certificate;
	onSubmit: (data: CertificateCreateInput | CertificateEditInput) => void;
	isLoading?: boolean;
	users?: User[];
	courses?: Course[];
}

export function CertificateForm({
	mode,
	defaultValues,
	onSubmit,
	isLoading,
	users = [],
	courses = [],
}: CertificateFormProps) {
	const schema =
		mode === "create" ? certificateCreateSchema : certificateEditSchema;

	const {
		register,
		handleSubmit,
		setValue,
		watch,
		formState: { errors },
	} = useForm<CertificateCreateInput | CertificateEditInput>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(schema) as unknown as Resolver<any>,
		defaultValues:
			mode === "edit" && defaultValues
				? {
						drive_file_id: defaultValues.drive_file_id ?? "",
						pdf_url: defaultValues.pdf_url ?? "",
						html_content: defaultValues.html_content ?? "",
					}
				: {
						user_id: "",
						course_id: "",
						drive_file_id: "",
						pdf_url: "",
						html_content: "",
						issued_at: "",
					},
	});

	const field =
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-muted-foreground/30";

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const selectedUserId = watch("user_id" as any);

	// The backend is the single source of truth for enrollment eligibility
	// (StudentMissingRequirementsError, surfaced via useCreateCertificate's
	// onError) — no client-side pre-check here, since it used to read from a
	// store snapshot that goes stale as soon as this session's data changes and
	// produced false "not enrolled" positives right after enrolling someone.
	const handleFormSubmit = (data: CertificateCreateInput | CertificateEditInput) => {
		onSubmit(data);
	};

	return (
		<form
			onSubmit={handleSubmit(handleFormSubmit)}
			className="space-y-5">
			
			{mode === "create" && (
				<div className="space-y-4 rounded-xl border border-border bg-muted/10 p-5">
					<div className="space-y-1.5">
						<label className="text-sm font-medium">Estudiante *</label>
						<UserCombobox
							users={users}
							value={selectedUserId || ""}
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							onChange={(val) => setValue("user_id" as any, val, { shouldValidate: true })}
						/>
						{"user_id" in errors && errors.user_id && (
							<p className="text-xs text-destructive mt-1">
								{(errors.user_id as { message?: string }).message}
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<label className="text-sm font-medium">Curso *</label>
						<CourseCombobox
							courses={courses}
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							value={watch("course_id" as any) || ""}
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							onChange={(val) => setValue("course_id" as any, val, { shouldValidate: true })}
						/>
						{"course_id" in errors && errors.course_id && (
							<p className="text-xs text-destructive mt-1">
								{(errors.course_id as { message?: string }).message}
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<label className="text-sm font-medium">
							Fecha de Emisión <span className="text-muted-foreground font-normal ml-1">(Opcional)</span>
						</label>
						<input
							{...register("issued_at" as any)}
							type="datetime-local"
							className={field}
						/>
						{"issued_at" in errors && errors.issued_at && (
							<p className="text-xs text-destructive mt-1">
								{(errors.issued_at as { message?: string }).message}
							</p>
						)}
						<p className="text-xs text-muted-foreground mt-1.5">
							Si no especificas una fecha, se usará el momento actual. Puedes elegir una fecha pasada si el certificado fue emitido antes.
						</p>
					</div>
				</div>
			)}

			<div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm">
				<h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
					<div className="p-1.5 rounded-md bg-primary/10 text-primary">
						<LinkIcon className="h-3.5 w-3.5" />
					</div>
					Enlace Externo
				</h3>
				
				{/* Manual pdf_url */}
				<div className="space-y-1.5">
					<label className="text-sm font-medium">
						URL del Documento PDF <span className="text-muted-foreground font-normal ml-1">(Opcional)</span>
					</label>
					<div className="relative">
						<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
							<LinkIcon className="h-4 w-4 text-muted-foreground" />
						</div>
						<input
							{...register("pdf_url")}
							type="url"
							placeholder="https://ejemplo.com/certificado.pdf"
							className={`${field} pl-9`}
						/>
					</div>
					{errors.pdf_url && (
						<p className="text-xs text-destructive mt-1">{errors.pdf_url.message}</p>
					)}
					<p className="text-xs text-muted-foreground mt-1.5">
						Ingresa un enlace directo al PDF del certificado si se encuentra alojado en otra plataforma.
					</p>
				</div>

				<div className="h-px w-full bg-border" />

				<h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
					<div className="p-1.5 rounded-md bg-primary/10 text-primary">
						<Code className="h-3.5 w-3.5" />
					</div>
					Plantilla Integrada
				</h3>

				{/* HTML content */}
				<div className="space-y-1.5">
					<label className="text-sm font-medium">
						Código HTML <span className="text-muted-foreground font-normal ml-1">(Opcional)</span>
					</label>
					<textarea
						{...register("html_content")}
						rows={5}
						placeholder="<div class='certificado'>...</div>"
						className="flex min-h-32 w-full rounded-md border border-input bg-muted/30 px-3 py-3 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-y transition-colors hover:border-muted-foreground/30 focus:bg-background"
					/>
					{"html_content" in errors && errors.html_content && (
						<p className="text-xs text-destructive mt-1">
							{(errors.html_content as { message?: string }).message}
						</p>
					)}
					<p className="text-xs text-muted-foreground mt-1.5">
						HTML para la verificación en línea del certificado. Si no provees una URL, esto se usará como vista principal.
					</p>
				</div>
			</div>

			<div className="pt-2">
				<button
					type="submit"
					disabled={isLoading}
					className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
					{isLoading
						? "Procesando..."
						: mode === "create"
							? "Emitir Certificado"
							: "Guardar Cambios"}
				</button>
			</div>
		</form>
	);
}
