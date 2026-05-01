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
import { Link as LinkIcon, Code, Search, ChevronDown, Check } from "lucide-react";

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
					},
	});

	const field =
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-muted-foreground/30";

	// Custom searchable combobox for user selection
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const selectedUserId = watch("user_id" as any);
	const selectedUser = users.find((u) => u.id === selectedUserId);
	
	const [userSearch, setUserSearch] = useState("");
	const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const filteredUsers = useMemo(() => {
		const q = userSearch.toLowerCase().trim();
		if (!q) return users.slice(0, 50); // Show max 50 initially
		return users
			.filter(
				(u) =>
					u.full_name?.toLowerCase().includes(q) ||
					u.first_name?.toLowerCase().includes(q) ||
					u.last_name?.toLowerCase().includes(q) ||
					u.document_number?.toLowerCase().includes(q) ||
					u.email?.toLowerCase().includes(q)
			)
			.slice(0, 50);
	}, [userSearch, users]);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsUserDropdownOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<form
			onSubmit={handleSubmit((data) => onSubmit(data))}
			className="space-y-5">
			
			{mode === "create" && (
				<div className="space-y-4 rounded-xl border border-border bg-muted/10 p-5">
					<div className="space-y-1.5" ref={dropdownRef}>
						<label className="text-sm font-medium">Estudiante *</label>
						<div className="relative">
							<button
								type="button"
								onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
								className={`${field} justify-between items-center text-left ${!selectedUser ? "text-muted-foreground" : ""}`}
							>
								{selectedUser ? (
									<span className="truncate">
										<span className="font-semibold text-foreground mr-1.5">{selectedUser.document_number}</span>
										{selectedUser.full_name || `${selectedUser.first_name} ${selectedUser.last_name}`.trim()}
									</span>
								) : (
									"Buscar estudiante por DNI o Nombre..."
								)}
								<ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
							</button>

							{isUserDropdownOpen && (
								<div className="absolute top-full z-50 mt-1.5 w-full rounded-lg border border-border bg-popover shadow-xl animate-in fade-in zoom-in-95">
									<div className="flex items-center border-b border-border px-3 py-2">
										<Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
										<input
											type="text"
											className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground h-8"
											placeholder="Escribe DNI o Nombre..."
											value={userSearch}
											onChange={(e) => setUserSearch(e.target.value)}
											onClick={(e) => e.stopPropagation()}
											autoFocus
										/>
									</div>
									<div className="max-h-60 overflow-y-auto p-1.5 scrollbar-thin">
										{filteredUsers.length === 0 ? (
											<div className="p-3 text-center text-sm text-muted-foreground">
												No se encontraron estudiantes
											</div>
										) : (
											filteredUsers.map((u) => (
												<button
													key={u.id}
													type="button"
													onClick={() => {
														// eslint-disable-next-line @typescript-eslint/no-explicit-any
														setValue("user_id" as any, u.id, { shouldValidate: true });
														setIsUserDropdownOpen(false);
														setUserSearch("");
													}}
													className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm text-left transition-colors hover:bg-accent hover:text-accent-foreground ${
														selectedUserId === u.id ? "bg-primary/10 text-primary font-medium" : ""
													}`}
												>
													<div className="flex flex-col truncate pr-2">
														<span className="truncate font-medium text-foreground">
															{u.full_name || `${u.first_name} ${u.last_name}`.trim()}
														</span>
														<span className="text-xs text-muted-foreground truncate mt-0.5">
															DNI: {u.document_number} · {u.email}
														</span>
													</div>
													{selectedUserId === u.id && <Check className="h-4 w-4 shrink-0" />}
												</button>
											))
										)}
									</div>
								</div>
							)}
						</div>
						{"user_id" in errors && errors.user_id && (
							<p className="text-xs text-destructive mt-1">
								{(errors.user_id as { message?: string }).message}
							</p>
						)}
					</div>

					<div className="space-y-1.5">
						<label className="text-sm font-medium">Curso *</label>
						{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
						<select {...register("course_id" as any)} className={field}>
							<option value="">Seleccionar curso…</option>
							{courses.map((c) => (
								<option key={c.id} value={c.id}>
									{c.title}
								</option>
							))}
						</select>
						{"course_id" in errors && errors.course_id && (
							<p className="text-xs text-destructive mt-1">
								{(errors.course_id as { message?: string }).message}
							</p>
						)}
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
