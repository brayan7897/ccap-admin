"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	useForm,
	useWatch,
	useFieldArray,
	type Resolver,
} from "react-hook-form";
import { X, Plus } from "lucide-react";
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
		defaultValues: {
			course_level: "BASIC",
			course_type: "FREE",
			price: null,
			is_published: false,
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

	// Auto-generate slug from title only when creating (no defaultValues.slug)
	const isNewCourse = !defaultValues?.slug;
	function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (isNewCourse) {
			setValue("slug", toSlug(e.target.value), { shouldValidate: false });
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
			setValue("tags", [...tags, val]);
			setTagInput("");
		}
	}

	function handleRemoveTag(tag: string) {
		setValue(
			"tags",
			tags.filter((t: string) => t !== tag),
		);
	}

	const field =
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
	const lbl = "block text-sm font-medium text-foreground mb-1";
	const err = "text-xs text-destructive mt-0.5";
	const rowInput =
		"flex h-9 flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

	return (
		<form
			onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
			className="space-y-5">
			{/* ── Título ──────────────────────────────────────── */}
			<div>
				<label className={lbl}>Título *</label>
				<input
					{...register("title")}
					onChange={(e) => {
						register("title").onChange(e);
						handleTitleChange(e);
					}}
					placeholder="Ej: Introducción a Python"
					className={field}
				/>
				{errors.title && <p className={err}>{errors.title.message}</p>}
			</div>

			{/* ── Slug ─────────────────────────────────────────── */}
			<div>
				<label className={lbl}>Slug (URL) *</label>
				<input
					{...register("slug")}
					placeholder="introduccion-a-python"
					className={field}
				/>
				{errors.slug && <p className={err}>{errors.slug.message}</p>}
				<p className="mt-0.5 text-xs text-muted-foreground">
					Solo letras minúsculas, números y guiones. Se genera automáticamente
					del título.
				</p>
			</div>

			{/* ── Miniatura ────────────────────────────────────── */}
			<div>
				<label className={lbl}>URL de miniatura</label>
				<input
					{...register("thumbnail_url")}
					placeholder="https://images.unsplash.com/..."
					className={field}
				/>
				{errors.thumbnail_url && (
					<p className={err}>{errors.thumbnail_url.message}</p>
				)}
			</div>

			{/* ── Descripción corta ────────────────────────────── */}
			<div>
				<label className={lbl}>Descripción corta</label>
				<input
					{...register("short_description")}
					placeholder="Resumen breve"
					className={field}
				/>
			</div>

			{/* ── Descripción completa ─────────────────────────── */}
			<div>
				<label className={lbl}>Descripción completa</label>
				<textarea
					{...register("description")}
					rows={4}
					placeholder="Descripción detallada del contenido…"
					className="flex min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				/>
			</div>

			{/* ── Nivel + Tipo ─────────────────────────────────── */}
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className={lbl}>Nivel *</label>
					<select {...register("course_level")} className={field}>
						{LEVELS.map((l) => (
							<option key={l.value} value={l.value}>
								{l.label}
							</option>
						))}
					</select>
					{errors.course_level && (
						<p className={err}>{errors.course_level.message}</p>
					)}
				</div>
				<div>
					<label className={lbl}>Tipo de curso *</label>
					<select {...register("course_type")} className={field}>
						<option value="FREE">Gratuito</option>
						<option value="PAID">De pago</option>
					</select>
					{errors.course_type && (
						<p className={err}>{errors.course_type.message}</p>
					)}
				</div>
			</div>

			{/* ── Precio (solo PAID) ───────────────────────────── */}
			{courseType === "PAID" && (
				<div>
					<label className={lbl}>Precio (S/.) *</label>
					<input
						{...register("price", { valueAsNumber: true })}
						type="number"
						min="0.01"
						step="0.01"
						placeholder="0.00"
						className={field}
					/>
					{errors.price && <p className={err}>{errors.price.message}</p>}
				</div>
			)}

			{/* ── Instructor ───────────────────────────────────── */}
			<div>
				<label className={lbl}>Instructor *</label>
				<select {...register("instructor_id")} className={field}>
					<option value="">— Selecciona un instructor —</option>
					{(instructors.length > 0 ? instructors : (users ?? [])).map((u) => (
						<option key={u.id} value={u.id}>
							{u.full_name || `${u.first_name} ${u.last_name}`} ({u.email})
						</option>
					))}
				</select>
				{errors.instructor_id && (
					<p className={err}>{errors.instructor_id.message}</p>
				)}
			</div>

			{/* ── Categoría ────────────────────────────────────── */}
			<div>
				<label className={lbl}>Categoría</label>
				<select {...register("category_id")} className={field}>
					<option value="">— Sin categoría —</option>
					{categories?.map((c) => (
						<option key={c.id} value={c.id}>
							{c.name}
						</option>
					))}
				</select>
				{errors.category_id && (
					<p className={err}>{errors.category_id.message}</p>
				)}
			</div>

			{/* ── Requisitos ───────────────────────────────────── */}
			<div>
				<label className={lbl}>Requisitos</label>
				<div className="space-y-2">
					{reqFields.map((f, idx) => (
						<div key={f.id} className="flex items-center gap-2">
							<input
								{...register(`requirements.${idx}` as const)}
								placeholder={`Requisito ${idx + 1}`}
								className={rowInput}
							/>
							<button
								type="button"
								onClick={() => removeReq(idx)}
								className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
								<X className="h-4 w-4" />
							</button>
						</div>
					))}
					<button
						type="button"
						onClick={() => addReq("")}
						className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
						<Plus className="h-4 w-4" /> Añadir requisito
					</button>
				</div>
			</div>

			{/* ── Lo que aprenderán ────────────────────────────── */}
			<div>
				<label className={lbl}>Lo que aprenderán</label>
				<div className="space-y-2">
					{learnFields.map((f, idx) => (
						<div key={f.id} className="flex items-center gap-2">
							<input
								{...register(`what_you_will_learn.${idx}` as const)}
								placeholder={`Logro ${idx + 1}`}
								className={rowInput}
							/>
							<button
								type="button"
								onClick={() => removeLearn(idx)}
								className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
								<X className="h-4 w-4" />
							</button>
						</div>
					))}
					<button
						type="button"
						onClick={() => addLearn("")}
						className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
						<Plus className="h-4 w-4" /> Añadir logro
					</button>
				</div>
			</div>

			{/* ── Etiquetas (tags) ─────────────────────────────── */}
			<div>
				<label className={lbl}>Etiquetas</label>
				<div className="flex flex-wrap gap-1.5 mb-2 min-h-6">
					{tags.map((tag: string) => (
						<span
							key={tag}
							className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
							{tag}
							<button
								type="button"
								onClick={() => handleRemoveTag(tag)}
								className="hover:text-destructive transition-colors">
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
						placeholder="ej: python  (Enter o + para añadir)"
						className={rowInput}
					/>
					<button
						type="button"
						onClick={handleAddTag}
						className="flex items-center gap-1 rounded-md border border-input px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors">
						<Plus className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* ── Publicar ─────────────────────────────────────── */}
			<div className="flex items-center gap-2">
				<input
					type="checkbox"
					id="is_published"
					{...register("is_published")}
					className="h-4 w-4 rounded border-input"
				/>
				<label htmlFor="is_published" className="text-sm font-medium">
					Publicar curso
				</label>
			</div>

			{/* ── Submit ───────────────────────────────────────── */}
			<button
				type="submit"
				disabled={isLoading}
				className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
				{isLoading ? "Guardando…" : "Guardar curso"}
			</button>
		</form>
	);
}
