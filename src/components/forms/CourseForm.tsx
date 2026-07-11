"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	useForm,
	useWatch,
	useFieldArray,
	type Resolver,
} from "react-hook-form";
import { X, Plus, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useState } from "react";

function toSlug(title: string): string {
	return title
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9\s-]/g, "")
		.trim()
		.replace(/\s+/g, "-");
}

import {
	courseSchema,
	type CourseInput,
} from "@/features/courses/schemas/course.schema";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { InstructorCombobox } from "@/components/shared/InstructorCombobox";

const LEVELS = [
	{ value: "BASIC", label: "Básico" },
	{ value: "INTERMEDIATE", label: "Intermedio" },
	{ value: "ADVANCED", label: "Avanzado" },
] as const;

interface CourseFormProps {
	defaultValues?: Partial<CourseInput>;
	onSubmit: (data: CourseInput) => void;
	isLoading?: boolean;
}

export function CourseForm({
	defaultValues,
	onSubmit,
	isLoading,
}: CourseFormProps) {
	const { data: users } = useUsers();
	const { data: categories } = useCategories();

	const instructors =
		users?.filter(
			(u) =>
				u.is_active &&
				(u.role_name?.toLowerCase().includes("instructor") ||
					u.role_name?.toLowerCase().includes("admin") ||
					u.role?.name?.toLowerCase().includes("instructor") ||
					u.role?.name?.toLowerCase().includes("admin")),
		) ?? [];

	const {
		register,
		handleSubmit,
		control,
		setValue,
		formState: { errors },
	} = useForm<CourseInput>({
		resolver: zodResolver(courseSchema) as Resolver<CourseInput>,
		mode: "onChange",
		defaultValues: {
			course_level: "BASIC",
			course_type: "FREE",
			price: null,
			status: "draft",
			featured: false,
			certificate_only: false,
			requirements: [],
			what_you_will_learn: [],
			tags: [],
			thumbnail_url: "",
			slug: "",
			...defaultValues,
		},
	});

	const courseType = useWatch({ control, name: "course_type" });
	const tags = useWatch({ control, name: "tags" }) ?? [];
	const status = useWatch({ control, name: "status" });
	const thumbnailUrl = useWatch({ control, name: "thumbnail_url" });
	const instructorId = useWatch({ control, name: "instructor_id" });

	const isNewCourse = !defaultValues?.slug;
	function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (isNewCourse) {
			setValue("slug", toSlug(e.target.value), { shouldValidate: true });
		}
	}

	const {
		fields: reqFields,
		append: addReq,
		remove: removeReq,
	} = useFieldArray({
		control,
		name: "requirements" as never,
	});

	const {
		fields: learnFields,
		append: addLearn,
		remove: removeLearn,
	} = useFieldArray({
		control,
		name: "what_you_will_learn" as never,
	});

	const [tagInput, setTagInput] = useState("");

	function handleAddTag() {
		const val = tagInput.trim();
		if (val && !tags.includes(val)) {
			setValue("tags", [...tags, val], { shouldValidate: true });
			setTagInput("");
		}
	}

	function handleRemoveTag(tag: string) {
		setValue(
			"tags",
			tags.filter((t: string) => t !== tag),
			{ shouldValidate: true }
		);
	}

	const fieldBase =
		"flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";
	const fieldError = "border-destructive focus-visible:ring-destructive";
	const fieldNormal = "border-input";
	
	const getFieldClass = (hasError: boolean) => 
		`${fieldBase} ${hasError ? fieldError : fieldNormal} h-10`;
	
	const getTextAreaClass = (hasError: boolean) => 
		`${fieldBase} ${hasError ? fieldError : fieldNormal} min-h-[100px]`;

	const lbl = "block text-sm font-medium text-foreground mb-1.5";
	const err = "flex items-center gap-1.5 text-xs text-destructive mt-1.5";

	return (
		<form
			onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
			className="grid grid-cols-1 lg:grid-cols-3 gap-8"
		>
			<div className="lg:col-span-2 space-y-6">
				{/* ── SECCIÓN: INFORMACIÓN PRINCIPAL ── */}
				<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
					<div className="border-b border-border bg-muted/40 px-6 py-4">
						<h3 className="text-lg font-medium text-foreground">Información Principal</h3>
						<p className="text-sm text-muted-foreground mt-1">Detalles básicos e identificadores del curso.</p>
					</div>
					<div className="p-6 space-y-5">
						<div>
							<label className={lbl}>Título del Curso *</label>
							<input
								{...register("title")}
								onChange={(e) => {
									register("title").onChange(e);
									handleTitleChange(e);
								}}
								placeholder="Ej: Introducción a Python"
								className={getFieldClass(!!errors.title)}
							/>
							{errors.title && <p className={err}><AlertCircle className="h-3.5 w-3.5" />{errors.title.message}</p>}
						</div>

						<div>
							<label className={lbl}>Slug (URL) *</label>
							<input
								{...register("slug")}
								placeholder="introduccion-a-python"
								className={getFieldClass(!!errors.slug)}
							/>
							{errors.slug && <p className={err}><AlertCircle className="h-3.5 w-3.5" />{errors.slug.message}</p>}
							<p className="mt-1.5 text-xs text-muted-foreground">
								Identificador único para la URL. Solo letras minúsculas, números y guiones.
							</p>
						</div>

						<div>
							<label className={lbl}>Descripción Corta</label>
							<input
								{...register("short_description")}
								placeholder="Resumen breve para tarjetas y listados"
								className={getFieldClass(!!errors.short_description)}
							/>
						</div>

						<div>
							<label className={lbl}>Descripción Completa</label>
							<textarea
								{...register("description")}
								placeholder="Descripción detallada del contenido del curso…"
								className={getTextAreaClass(!!errors.description)}
							/>
						</div>
					</div>
				</div>

				{/* ── SECCIÓN: DETALLES ACADÉMICOS ── */}
				<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
					<div className="border-b border-border bg-muted/40 px-6 py-4">
						<h3 className="text-lg font-medium text-foreground">Detalles Académicos</h3>
						<p className="text-sm text-muted-foreground mt-1">Nivel, categoría, precio y asignación.</p>
					</div>
					<div className="p-6 space-y-5">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<div>
								<label className={lbl}>Nivel *</label>
								<select {...register("course_level")} className={getFieldClass(!!errors.course_level)}>
									{LEVELS.map((l) => (
										<option key={l.value} value={l.value}>
											{l.label}
										</option>
									))}
								</select>
								{errors.course_level && <p className={err}><AlertCircle className="h-3.5 w-3.5" />{errors.course_level.message}</p>}
							</div>
							<div>
								<label className={lbl}>Tipo de curso *</label>
								<select {...register("course_type")} className={getFieldClass(!!errors.course_type)}>
									<option value="FREE">Gratuito</option>
									<option value="PAID">De pago</option>
								</select>
								{errors.course_type && <p className={err}><AlertCircle className="h-3.5 w-3.5" />{errors.course_type.message}</p>}
							</div>
						</div>

						{courseType === "PAID" && (
							<div className="w-full md:w-1/2">
								<label className={lbl}>Precio (S/.) *</label>
								<div className="relative">
									<span className="absolute left-3 top-2.5 text-muted-foreground">S/</span>
									<input
										{...register("price", { valueAsNumber: true })}
										type="number"
										min="0.01"
										step="0.01"
										placeholder="0.00"
										className={`${getFieldClass(!!errors.price)} pl-8`}
									/>
								</div>
								{errors.price && <p className={err}><AlertCircle className="h-3.5 w-3.5" />{errors.price.message}</p>}
							</div>
						)}

						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<div>
								<label className={lbl}>Instructor *</label>
								<InstructorCombobox
									instructors={instructors.length > 0 ? instructors : (users ?? [])}
									value={instructorId || ""}
									onChange={(val) => setValue("instructor_id", val, { shouldValidate: true })}
								/>
								{errors.instructor_id && <p className={err}><AlertCircle className="h-3.5 w-3.5" />{errors.instructor_id.message}</p>}
							</div>
							<div>
								<label className={lbl}>Categoría</label>
								<select {...register("category_id")} className={getFieldClass(!!errors.category_id)}>
									<option value="">— Sin categoría —</option>
									{categories?.map((c) => (
										<option key={c.id} value={c.id}>
											{c.name}
										</option>
									))}
								</select>
								{errors.category_id && <p className={err}><AlertCircle className="h-3.5 w-3.5" />{errors.category_id.message}</p>}
							</div>
						</div>
					</div>
				</div>

				{/* ── SECCIÓN: REQUISITOS Y LOGROS ── */}
				<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
					<div className="border-b border-border bg-muted/40 px-6 py-4">
						<h3 className="text-lg font-medium text-foreground">Requisitos y Logros</h3>
						<p className="text-sm text-muted-foreground mt-1">Define qué se necesita y qué se obtendrá.</p>
					</div>
					<div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
						<div>
							<label className={lbl}>Requisitos Previos</label>
							<div className="space-y-3 mt-3">
								{reqFields.map((f, idx) => (
									<div key={f.id} className="flex items-center gap-2">
										<input
											{...register(`requirements.${idx}` as const)}
											placeholder={`Ej: Conocimientos básicos de PC`}
											className={`${getFieldClass(false)} h-9`}
										/>
										<button
											type="button"
											onClick={() => removeReq(idx)}
											className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
										>
											<X className="h-4 w-4" />
										</button>
									</div>
								))}
								<button
									type="button"
									onClick={() => addReq("")}
									className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
								>
									<Plus className="h-4 w-4" /> Agregar requisito
								</button>
							</div>
						</div>

						<div>
							<label className={lbl}>Lo que aprenderán</label>
							<div className="space-y-3 mt-3">
								{learnFields.map((f, idx) => (
									<div key={f.id} className="flex items-center gap-2">
										<input
											{...register(`what_you_will_learn.${idx}` as const)}
											placeholder={`Ej: Crear aplicaciones web`}
											className={`${getFieldClass(false)} h-9`}
										/>
										<button
											type="button"
											onClick={() => removeLearn(idx)}
											className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
										>
											<X className="h-4 w-4" />
										</button>
									</div>
								))}
								<button
									type="button"
									onClick={() => addLearn("")}
									className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
								>
									<Plus className="h-4 w-4" /> Agregar logro
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-6">
				{/* ── SECCIÓN: PUBLICACIÓN Y ACCIONES ── */}
				<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden sticky top-6">
					<div className="p-6 space-y-6">
						<div>
							<h3 className="text-lg font-medium text-foreground mb-4">Estado del Curso</h3>
							<div>
								<label className={lbl}>Estado *</label>
								<select {...register("status")} className={getFieldClass(!!errors.status)}>
									<option value="draft">Borrador</option>
									<option value="published">Publicado</option>
									<option value="archived">Archivado</option>
								</select>
								<p className="mt-1.5 text-xs text-muted-foreground">
									{status === "draft" && "Oculto para los estudiantes mientras se termina de preparar."}
									{status === "published" && "Visible para los estudiantes en el catálogo y el landing."}
									{status === "archived" && "Curso antiguo oculto del catálogo público, pero conserva certificados e inscripciones."}
								</p>
							</div>

							<div className="mt-5 space-y-3">
								<label className="flex items-center justify-between cursor-pointer rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors">
									<div>
										<p className="font-medium text-sm text-foreground">Destacar en landing</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											Aparecerá en la sección de cursos destacados de la página pública.
										</p>
									</div>
									<div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 shrink-0 ml-4">
										<input type="checkbox" {...register("featured")} className="peer sr-only" />
										<div className="h-6 w-11 rounded-full bg-muted border-2 border-transparent transition-colors peer-checked:bg-primary"></div>
										<div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></div>
									</div>
								</label>

								<label className="flex items-center justify-between cursor-pointer rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors">
									<div>
										<p className="font-medium text-sm text-foreground">Solo para certificado</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											Oculto del catálogo, la búsqueda y el acceso directo por link en la
											página pública. Se sigue gestionando con normalidad desde el admin
											(inscripción, certificados).
										</p>
									</div>
									<div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 shrink-0 ml-4">
										<input type="checkbox" {...register("certificate_only")} className="peer sr-only" />
										<div className="h-6 w-11 rounded-full bg-muted border-2 border-transparent transition-colors peer-checked:bg-primary"></div>
										<div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"></div>
									</div>
								</label>
							</div>
						</div>

						<div className="pt-2">
							<button
								type="submit"
								disabled={isLoading}
								className="flex w-full h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
							>
								{isLoading ? (
									"Guardando..."
								) : isNewCourse ? (
									"Guardar y continuar a módulos"
								) : (
									"Guardar cambios"
								)}
							</button>
						</div>
					</div>
				</div>

				{/* ── SECCIÓN: MULTIMEDIA ── */}
				<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
					<div className="border-b border-border bg-muted/40 px-6 py-4">
						<h3 className="text-base font-medium text-foreground">Multimedia</h3>
					</div>
					<div className="p-6 space-y-4">
						<div>
							<label className={lbl}>URL de Miniatura</label>
							<input
								{...register("thumbnail_url")}
								placeholder="https://ejemplo.com/imagen.jpg"
								className={getFieldClass(!!errors.thumbnail_url)}
							/>
							{errors.thumbnail_url && <p className={err}><AlertCircle className="h-3.5 w-3.5" />{errors.thumbnail_url.message}</p>}
						</div>

						<div className="mt-4">
							<p className="text-sm font-medium text-foreground mb-2">Previsualización</p>
							<div className="aspect-video w-full rounded-lg border-2 border-dashed border-border bg-muted/20 flex flex-col items-center justify-center overflow-hidden relative">
								{thumbnailUrl ? (
									/* eslint-disable-next-line @next/next/no-img-element */
									<img
										src={thumbnailUrl}
										alt="Vista previa"
										className="h-full w-full object-cover"
										onError={(e) => {
											e.currentTarget.style.display = 'none';
											e.currentTarget.parentElement?.classList.add('error-image');
										}}
										onLoad={(e) => {
											e.currentTarget.style.display = 'block';
											e.currentTarget.parentElement?.classList.remove('error-image');
										}}
									/>
								) : (
									<div className="flex flex-col items-center justify-center text-muted-foreground/60">
										<ImageIcon className="h-10 w-10 mb-2" />
										<span className="text-xs">Sin imagen</span>
									</div>
								)}
								<style dangerouslySetInnerHTML={{__html: `
									.error-image::after {
										content: "Enlace de imagen inválido";
										position: absolute;
										font-size: 0.75rem;
										color: var(--destructive);
									}
									.error-image svg { display: none; }
								`}} />
							</div>
						</div>
					</div>
				</div>

				{/* ── SECCIÓN: ETIQUETAS ── */}
				<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
					<div className="border-b border-border bg-muted/40 px-6 py-4">
						<h3 className="text-base font-medium text-foreground">Etiquetas</h3>
					</div>
					<div className="p-6">
						<div className="flex flex-wrap gap-2 mb-4 min-h-[28px]">
							{tags.length === 0 && <span className="text-sm text-muted-foreground italic">No hay etiquetas</span>}
							{tags.map((tag: string) => (
								<span
									key={tag}
									className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
								>
									{tag}
									<button
										type="button"
										onClick={() => handleRemoveTag(tag)}
										className="hover:text-destructive hover:bg-destructive/10 rounded-full p-0.5 transition-colors"
									>
										<X className="h-3 w-3" />
									</button>
								</span>
							))}
						</div>
						<div className="flex gap-2">
							<input
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAddTag();
									}
								}}
								placeholder="Ej: python (Enter para añadir)"
								className={`${getFieldClass(false)} h-9`}
							/>
							<button
								type="button"
								onClick={handleAddTag}
								className="flex items-center justify-center h-9 w-9 shrink-0 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
							>
								<Plus className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>
			</div>
		</form>
	);
}

