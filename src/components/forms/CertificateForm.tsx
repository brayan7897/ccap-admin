"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import {
	certificateCreateSchema,
	certificateEditSchema,
	type CertificateCreateInput,
	type CertificateEditInput,
} from "@/features/certificates/schemas/certificate.schema";
import type { Certificate, User, Course } from "@/types";
import { FileText, UploadCloud, X } from "lucide-react";

interface CertificateFormProps {
	mode: "create" | "edit";
	defaultValues?: Certificate;
	onSubmit: (data: CertificateCreateInput | CertificateEditInput) => void;
	isLoading?: boolean;
	users?: User[];
	courses?: Course[];
	pdfFile?: File | null;
	onPdfFileChange?: (file: File | null) => void;
}

export function CertificateForm({
	mode,
	defaultValues,
	onSubmit,
	isLoading,
	users = [],
	courses = [],
	pdfFile,
	onPdfFileChange,
}: CertificateFormProps) {
	const schema =
		mode === "create" ? certificateCreateSchema : certificateEditSchema;

	const {
		register,
		handleSubmit,
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
					},
	});

	const field =
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

	return (
		<form
			onSubmit={handleSubmit((data) => onSubmit(data))}
			className="space-y-4">
			{mode === "create" && (
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="space-y-1">
						<label className="text-sm font-medium">Estudiante *</label>
						<select {...register("user_id")} className={field}>
							<option value="">Seleccionar estudiante…</option>
							{users.map((u) => (
								<option key={u.id} value={u.id}>
									{u.full_name ?? `${u.first_name} ${u.last_name}`.trim()} —{" "}
									{u.email}
								</option>
							))}
						</select>
						{"user_id" in errors && errors.user_id && (
							<p className="text-xs text-destructive">
								{(errors.user_id as { message?: string }).message}
							</p>
						)}
					</div>

					<div className="space-y-1">
						<label className="text-sm font-medium">Curso *</label>
						<select {...register("course_id")} className={field}>
							<option value="">Seleccionar curso…</option>
							{courses.map((c) => (
								<option key={c.id} value={c.id}>
									{c.title}
								</option>
							))}
						</select>
						{"course_id" in errors && errors.course_id && (
							<p className="text-xs text-destructive">
								{(errors.course_id as { message?: string }).message}
							</p>
						)}
					</div>
				</div>
			)}

			{/* PDF upload */}
			<div className="space-y-1">
				<label className="text-sm font-medium">
					PDF del certificado{" "}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
				</label>

				{pdfFile ? (
					<div className="flex items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
						<FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
						<span className="flex-1 truncate text-foreground">
							{pdfFile.name}
						</span>
						<button
							type="button"
							onClick={() => onPdfFileChange?.(null)}
							className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive transition-colors"
							title="Quitar archivo">
							<X className="h-4 w-4" />
						</button>
					</div>
				) : (
					<label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-input bg-background px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
						<UploadCloud className="h-6 w-6" />
						<span>Haz clic para seleccionar un PDF</span>
						<input
							type="file"
							accept="application/pdf,.pdf"
							className="hidden"
							onChange={(e) => onPdfFileChange?.(e.target.files?.[0] ?? null)}
						/>
					</label>
				)}
				<p className="text-xs text-muted-foreground">
					Solo se aceptan archivos PDF.
				</p>
			</div>

			{/* Manual pdf_url — only shown when no file is selected */}
			{!pdfFile && (
				<div className="space-y-1">
					<label className="text-sm font-medium">
						PDF URL{" "}
						<span className="font-normal text-muted-foreground">
							(Opcional)
						</span>
					</label>
					<input
						{...register("pdf_url")}
						placeholder="https://drive.google.com/file/d/…"
						className={field}
					/>
					{errors.pdf_url && (
						<p className="text-xs text-destructive">{errors.pdf_url.message}</p>
					)}
				</div>
			)}

			{/* HTML content */}
			<div className="space-y-1">
				<label className="text-sm font-medium">
					Contenido HTML{" "}
					<span className="font-normal text-muted-foreground">(Opcional)</span>
				</label>
				<textarea
					{...register("html_content")}
					rows={5}
					placeholder="<html>...</html> — HTML completo del certificado listo para imprimir"
					className="flex min-h-25 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-y"
				/>
				{"html_content" in errors && errors.html_content && (
					<p className="text-xs text-destructive">
						{(errors.html_content as { message?: string }).message}
					</p>
				)}
				<p className="text-xs text-muted-foreground">
					HTML renderizado del certificado. Se usa para la vista de verificación
					y la impresión.
				</p>
			</div>

			<button
				type="submit"
				disabled={isLoading}
				className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
				{isLoading
					? "Guardando…"
					: mode === "create"
						? "Crear Certificado"
						: "Guardar Cambios"}
			</button>
		</form>
	);
}
