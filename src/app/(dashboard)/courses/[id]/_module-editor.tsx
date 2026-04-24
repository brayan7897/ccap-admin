"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	useModules,
	useCreateModule,
	useDeleteModule,
} from "@/features/modules/hooks/useModules";
import {
	useLessons,
	useCreateLesson,
	useUpdateLesson,
	useDeleteLesson,
} from "@/features/lessons/hooks/useLessons";
import {
	useResources,
	useCreateResource,
	useDeleteResource,
	useUploadResource,
} from "@/features/resources/hooks/useResources";
import { moduleSchema } from "@/features/modules/schemas/module.schema";
import { modulesService } from "@/features/modules/services/modules.service";
import { lessonsService } from "@/features/lessons/services/lessons.service";
import {
	lessonSchema,
	type LessonInput,
} from "@/features/lessons/schemas/lesson.schema";
import type { Module, Lesson, Resource } from "@/types";
import {
	ChevronDown,
	ChevronRight,
	ChevronUp,
	ExternalLink,
	FileText,
	FolderOpen,
	HardDrive,
	Layers,
	Link,
	Paperclip,
	Pencil,
	Plus,
	Trash2,
	UploadCloud,
	X,
	Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ModuleFields = {
	title: string;
	description?: string;
	order_index: number;
};

// ── Input styles ───────────────────────────────────────────────────────────────
const inputCls =
	"w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
const smInputCls =
	"w-full rounded border border-input bg-background px-2.5 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring";
const labelCls = "block text-xs font-medium text-muted-foreground mb-0.5";

// ── Module form ────────────────────────────────────────────────────────────────
interface ModuleFormProps {
	courseId: string;
	module?: Module;
	nextOrderIndex?: number;
	onDone: () => void;
}

function ModuleForm({
	courseId,
	module,
	nextOrderIndex = 0,
	onDone,
}: ModuleFormProps) {
	const create = useCreateModule(courseId);
	const schema = moduleSchema.omit({ course_id: true });

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ModuleFields>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(schema) as any,
		defaultValues: module
			? {
					title: module.title,
					description: module.description ?? "",
					order_index: module.order_index,
				}
			: { order_index: nextOrderIndex },
	});

	// For editing an existing module we call the service directly so we can
	// pass a specific id without having to instantiate a hook per module.
	const qc = useQueryClient();
	const updateModule = useMutation({
		mutationFn: (data: Partial<ModuleFields>) =>
			modulesService.update(courseId, module!.id, data),
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: ["modules", { courseId }] }),
	});

	const isPending = create.isPending || updateModule.isPending;

	const onSubmit = async (data: ModuleFields) => {
		if (module) {
			await updateModule.mutateAsync(data);
		} else {
			await create.mutateAsync(data);
		}
		onDone();
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="grid gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
			<div className="flex items-center gap-2 pb-1 border-b border-primary/20">
				<Layers className="h-4 w-4 text-primary" />
				<span className="text-sm font-semibold text-foreground">
					{module ? "Editar módulo" : "Nuevo módulo"}
				</span>
			</div>
			<div className="grid grid-cols-[1fr_auto] gap-3">
				<div>
					<label className={labelCls}>Título del módulo *</label>
					<input
						{...register("title")}
						placeholder="ej. Introducción al curso"
						className={inputCls}
					/>
					{errors.title && (
						<p className="mt-0.5 text-xs text-destructive">
							{errors.title.message}
						</p>
					)}
				</div>
				<div>
					<label className={labelCls}>Orden</label>
					<input
						{...register("order_index", { valueAsNumber: true })}
						type="number"
						min={0}
						placeholder="N°"
						className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-center text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
					/>
				</div>
			</div>
			<div>
				<label className={labelCls}>Descripción</label>
				<textarea
					{...register("description")}
					placeholder="Descripción del módulo (opcional)"
					rows={2}
					className="w-full resize-none rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
				/>
			</div>
			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={onDone}
					className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors">
					<X className="h-3.5 w-3.5" /> Cancelar
				</button>
				<button
					type="submit"
					disabled={isPending}
					className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
					<Check className="h-3.5 w-3.5" />{" "}
					{module ? "Guardar cambios" : "Crear módulo"}
				</button>
			</div>
		</form>
	);
}

// ── Lesson type labels ─────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
	VIDEO: "Video",
	PDF: "PDF",
	TEXT: "Texto",
};

// ── Lesson uploader (create new lesson via file upload) ────────────────────────
interface LessonUploaderProps {
	moduleId: string;
	nextOrderIndex: number;
	onDone: () => void;
}

// ── Lesson create form (metadata only — no file upload) ────────────────────────
function LessonCreateForm({
	moduleId,
	nextOrderIndex,
	onDone,
}: LessonUploaderProps) {
	const create = useCreateLesson(moduleId);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LessonInput>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(lessonSchema) as any,
		defaultValues: {
			lesson_type: "VIDEO",
			order_index: nextOrderIndex,
		},
	});

	const onSubmit = async (data: LessonInput) => {
		await create.mutateAsync({
			...data,
			duration_seconds: data.duration_seconds
				? data.duration_seconds * 60
				: undefined,
		});
		onDone();
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="grid gap-3 rounded border border-emerald-200/70 dark:border-emerald-800/30 bg-emerald-50/40 dark:bg-emerald-950/20 px-4 py-3">
			<div className="flex items-center gap-2 pb-0.5 border-b border-emerald-200/60 dark:border-emerald-800/30">
				<FileText className="h-3.5 w-3.5 text-emerald-500" />
				<span className="text-xs font-semibold text-foreground">
					Nueva lección
				</span>
			</div>
			<div className="grid grid-cols-[1fr_auto] gap-2">
				<div>
					<label className={labelCls}>Título de la lección *</label>
					<input
						{...register("title")}
						placeholder="ej. Introducción al tema"
						className={smInputCls}
					/>
					{errors.title && (
						<p className="mt-0.5 text-xs text-destructive">
							{errors.title.message}
						</p>
					)}
				</div>
				<div>
					<label className={labelCls}>Tipo</label>
					<select
						{...register("lesson_type")}
						className="rounded border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
						{Object.entries(TYPE_LABELS).map(([val, lbl]) => (
							<option key={val} value={val}>
								{lbl}
							</option>
						))}
					</select>
				</div>
			</div>
			<div>
				<label className={labelCls}>Duración estimada (minutos)</label>
				<input
					{...register("duration_seconds", { valueAsNumber: true })}
					type="number"
					min={0}
					placeholder="0"
					className={smInputCls}
				/>
			</div>
			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={onDone}
					className="flex items-center gap-1 rounded px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors">
					<X className="h-3 w-3" /> Cancelar
				</button>
				<button
					type="submit"
					disabled={create.isPending}
					className="flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
					<Check className="h-3 w-3" />{" "}
					{create.isPending ? "Creando…" : "Crear lección"}
				</button>
			</div>
		</form>
	);
}

// ── Drive URL parser ──────────────────────────────────────────────────────────
/**
 * Extracts the Google Drive file ID from common Drive / Docs URLs.
 * Supports:
 *   https://drive.google.com/file/d/{id}/view
 *   https://drive.google.com/open?id={id}
 *   https://drive.google.com/uc?id={id}
 *   https://docs.google.com/document/d/{id}/...
 *   https://docs.google.com/presentation/d/{id}/...
 *   https://docs.google.com/spreadsheets/d/{id}/...
 */
function extractDriveFileId(url: string): string | null {
	if (!url.trim()) return null;
	try {
		// /file/d/{id} or /document/d/{id} etc.
		const slashD = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/);
		if (slashD) return slashD[1];
		// ?id={id}
		const urlObj = new URL(url);
		const idParam = urlObj.searchParams.get("id");
		if (idParam && idParam.length >= 10) return idParam;
		return null;
	} catch {
		return null;
	}
}

// ── Resource format labels ─────────────────────────────────────────────────────
const FORMAT_LABELS: Record<string, string> = {
	VIDEO: "Video",
	PDF: "PDF",
	DOCUMENT: "Doc",
	LINK: "Enlace",
	IMAGE: "Imagen",
};

const FORMAT_ICONS: Record<string, React.ReactNode> = {
	VIDEO: <FileText className="h-3 w-3" />,
	PDF: <FileText className="h-3 w-3" />,
	DOCUMENT: <FileText className="h-3 w-3" />,
	LINK: <ExternalLink className="h-3 w-3" />,
	IMAGE: <FileText className="h-3 w-3" />,
};

// ── Resource adder ─────────────────────────────────────────────────────────────
interface ResourceAdderProps {
	lessonId: string;
	nextOrderIndex: number;
	onDone: () => void;
}

function ResourceAdder({
	lessonId,
	nextOrderIndex,
	onDone,
}: ResourceAdderProps) {
	// TODO: Re-habilitar cuando la API soporte subida directa de archivos
	// const [mode, setMode] = useState<"file" | "link" | "drive">("drive");
	// const fileRef = useRef<HTMLInputElement>(null);

	// ── File upload (deshabilitado temporalmente) ──────────────────────────────
	// const [file, setFile] = useState<File | null>(null);
	// const [uploadTitle, setUploadTitle] = useState("");
	// const [resourceType, setResourceType] = useState<"MAIN" | "SECONDARY">("SECONDARY");
	// const [resourceFormat, setResourceFormat] = useState<"VIDEO" | "PDF" | "DOCUMENT" | "LINK" | "IMAGE">("VIDEO");
	// const { upload, progress, isPending: uploadPending } = useUploadResource(lessonId);
	// const fmt = (b: number) =>
	// 	b > 1_048_576 ? `${(b / 1_048_576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;
	// const handleFileSubmit = async (e: React.FormEvent) => {
	// 	e.preventDefault();
	// 	if (!file || !uploadTitle.trim()) return;
	// 	await upload({ file, title: uploadTitle.trim(), resource_type: resourceType, resource_format: resourceFormat, order_index: nextOrderIndex });
	// 	onDone();
	// };

	// ── Enlace externo (deshabilitado temporalmente) ───────────────────────────
	// const [linkTitle, setLinkTitle] = useState("");
	// const [linkUrl, setLinkUrl] = useState("");
	// const [linkType, setLinkType] = useState<"MAIN" | "SECONDARY">("SECONDARY");
	// const handleLinkSubmit = async (e: React.FormEvent) => {
	// 	e.preventDefault();
	// 	if (!linkTitle.trim() || !linkUrl.trim()) return;
	// 	await createResource.mutateAsync({ title: linkTitle.trim(), resource_type: linkType, resource_format: "LINK", order_index: nextOrderIndex, external_url: linkUrl.trim(), drive_file_id: null });
	// 	onDone();
	// };

	// ── Drive link ─────────────────────────────────────────────────────────────
	const createResource = useCreateResource(lessonId);
	const [driveTitle, setDriveTitle] = useState("");
	const [driveUrl, setDriveUrl] = useState("");
	const [driveType, setDriveType] = useState<"MAIN" | "SECONDARY">("SECONDARY");
	const [driveFormat, setDriveFormat] = useState<
		"VIDEO" | "PDF" | "DOCUMENT" | "IMAGE"
	>("VIDEO");
	const extractedDriveId = extractDriveFileId(driveUrl);

	const handleDriveSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!driveTitle.trim() || !extractedDriveId) return;
		await createResource.mutateAsync({
			title: driveTitle.trim(),
			resource_type: driveType,
			resource_format: driveFormat,
			order_index: nextOrderIndex,
			drive_file_id: extractedDriveId,
			external_url: null,
		});
		onDone();
	};

	return (
		<div className="rounded border border-amber-200/70 dark:border-amber-800/30 bg-amber-50/40 dark:bg-amber-950/20 px-4 py-3 space-y-3">
			<div className="flex items-center gap-2 pb-1.5 border-b border-amber-200/60 dark:border-amber-800/30">
				<Paperclip className="h-3.5 w-3.5 text-amber-500" />
				<span className="text-xs font-semibold text-foreground">
					Nuevo recurso
				</span>
			</div>
			{/* Mode tabs — deshabilitados temporalmente, solo Drive disponible */}
			{/* <div className="flex gap-1 rounded-md border border-border bg-background p-0.5 w-fit">
				<button type="button" onClick={() => setMode("file")} ...>
					<UploadCloud /> Subir archivo
				</button>
				<button type="button" onClick={() => setMode("link")} ...>
					<Link /> Enlace externo
				</button>
				<button type="button" onClick={() => setMode("drive")} ...>
					<HardDrive /> Link de Drive
				</button>
			</div> */}

			{/* Solo modo Drive activo */}
			<form onSubmit={handleDriveSubmit} className="grid gap-2">
				<div className="grid grid-cols-[1fr_auto_auto] gap-2">
					<div>
						<label className={labelCls}>Título *</label>
						<input
							value={driveTitle}
							onChange={(e) => setDriveTitle(e.target.value)}
							placeholder="ej. Video de la clase"
							className={smInputCls}
							required
						/>
					</div>
					<div>
						<label className={labelCls}>Tipo</label>
						<select
							value={driveType}
							onChange={(e) =>
								setDriveType(e.target.value as "MAIN" | "SECONDARY")
							}
							className="rounded border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
							<option value="MAIN">Principal</option>
							<option value="SECONDARY">Secundario</option>
						</select>
					</div>
					<div>
						<label className={labelCls}>Formato</label>
						<select
							value={driveFormat}
							onChange={(e) =>
								setDriveFormat(e.target.value as typeof driveFormat)
							}
							className="rounded border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
							<option value="VIDEO">Video</option>
							<option value="PDF">PDF</option>
							<option value="DOCUMENT">Doc</option>
							<option value="IMAGE">Imagen</option>
						</select>
					</div>
				</div>
				<div>
					<label className={labelCls}>URL de Google Drive *</label>
					<input
						value={driveUrl}
						onChange={(e) => setDriveUrl(e.target.value)}
						placeholder="https://drive.google.com/file/d/…/view"
						className={smInputCls}
						required
					/>
				</div>
				{driveUrl && (
					<div
						className={cn(
							"flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs",
							extractedDriveId
								? "border-green-500/40 bg-green-500/5 text-green-700 dark:text-green-400"
								: "border-destructive/40 bg-destructive/5 text-destructive",
						)}>
						{extractedDriveId ? (
							<>
								<Check className="h-3 w-3 shrink-0" />
								<span className="font-medium">ID extraído:</span>
								<code className="truncate font-mono">{extractedDriveId}</code>
							</>
						) : (
							<>
								<X className="h-3 w-3 shrink-0" />
								<span>No se pudo extraer el ID. Verifica la URL de Drive.</span>
							</>
						)}
					</div>
				)}
				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={onDone}
						className="flex items-center gap-1 rounded px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors">
						<X className="h-3 w-3" /> Cancelar
					</button>
					<button
						type="submit"
						disabled={
							createResource.isPending ||
							!driveTitle.trim() ||
							!extractedDriveId
						}
						className="flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
						<HardDrive className="h-3 w-3" />{" "}
						{createResource.isPending ? "Guardando…" : "Agregar desde Drive"}
					</button>
				</div>
			</form>
		</div>
	);
}

// ── Resources section (inside a lesson) ───────────────────────────────────────
interface ResourcesSectionProps {
	lessonId: string;
}

function ResourcesSection({ lessonId }: ResourcesSectionProps) {
	const { data: resources = [], isLoading } = useResources(lessonId);
	const deleteResource = useDeleteResource(lessonId);
	const [adding, setAdding] = useState(false);

	const sorted = [...resources].sort((a, b) => {
		if (a.resource_type === "MAIN" && b.resource_type !== "MAIN") return -1;
		if (a.resource_type !== "MAIN" && b.resource_type === "MAIN") return 1;
		return a.order_index - b.order_index;
	});

	const renderResource = (resource: Resource) => (
		<div
			key={resource.id}
			className="flex items-center justify-between px-6 py-1.5 text-xs hover:bg-muted/30 transition-colors">
			<div className="flex min-w-0 items-center gap-2">
				<span className="flex items-center gap-0.5 text-muted-foreground">
					{FORMAT_ICONS[resource.resource_format]}
				</span>
				<span className="truncate text-foreground">{resource.title}</span>
				<span
					className={cn(
						"shrink-0 rounded px-1.5 py-0.5 text-xs font-medium",
						resource.resource_type === "MAIN"
							? "bg-primary/10 text-primary"
							: "bg-muted text-muted-foreground",
					)}>
					{resource.resource_type === "MAIN" ? "Principal" : "Secundario"}
				</span>
				<span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
					{FORMAT_LABELS[resource.resource_format]}
				</span>
				{resource.external_url && (
					<a
						href={resource.external_url}
						target="_blank"
						rel="noopener noreferrer"
						onClick={(e) => e.stopPropagation()}
						className="text-muted-foreground hover:text-primary transition-colors">
						<ExternalLink className="h-3 w-3" />
					</a>
				)}
			</div>
			<button
				onClick={() => deleteResource.mutate(resource.id)}
				className="ml-2 shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
				title="Eliminar recurso">
				<Trash2 className="h-3 w-3" />
			</button>
		</div>
	);

	return (
		<div className="bg-amber-50/20 dark:bg-amber-950/10">
			{/* Compact resource list header */}
			<div className="flex items-center gap-1.5 px-3 py-1 border-b border-amber-200/50 dark:border-amber-800/20">
				<Paperclip className="h-3 w-3 text-amber-500" />
				<span className="text-xs font-medium text-amber-700 dark:text-amber-400">
					Recursos
				</span>
				{sorted.length > 0 && (
					<span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 text-xs tabular-nums text-amber-700 dark:text-amber-400">
						{sorted.length}
					</span>
				)}
			</div>
			{isLoading && (
				<p className="px-4 py-1.5 text-xs text-muted-foreground">
					Cargando recursos…
				</p>
			)}
			{!isLoading && sorted.length === 0 && !adding && (
				<p className="px-4 py-1.5 text-xs text-muted-foreground/60 italic">
					Sin recursos aún.
				</p>
			)}
			{sorted.map(renderResource)}
			{adding && (
				<div className="px-3 py-2">
					<ResourceAdder
						lessonId={lessonId}
						nextOrderIndex={resources.length}
						onDone={() => setAdding(false)}
					/>
				</div>
			)}
			{!adding && (
				<button
					onClick={() => setAdding(true)}
					className="flex w-full items-center gap-1.5 px-4 py-1.5 text-xs text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50/60 dark:hover:bg-amber-900/20 transition-colors">
					<Plus className="h-3 w-3" /> Añadir recurso
				</button>
			)}
		</div>
	);
}

// ── Lesson metadata form (edit only) ──────────────────────────────────────────
interface LessonFormProps {
	moduleId: string;
	lesson: Lesson;
	onDone: () => void;
}

function LessonForm({ moduleId, lesson, onDone }: LessonFormProps) {
	const update = useUpdateLesson(moduleId, lesson.id);

	// duration_seconds stored in API, but we show/edit as minutes
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LessonInput>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(lessonSchema) as any,
		defaultValues: {
			title: lesson.title,
			lesson_type: lesson.lesson_type,
			order_index: lesson.order_index,
			// show minutes to the user
			duration_seconds: lesson.duration_seconds
				? Math.round(lesson.duration_seconds / 60)
				: undefined,
		},
	});

	const onSubmit = async (data: LessonInput) => {
		await update.mutateAsync({
			...data,
			// convert minutes back to seconds for the API
			duration_seconds: data.duration_seconds
				? data.duration_seconds * 60
				: undefined,
		});
		onDone();
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="grid gap-2 rounded border border-emerald-200/70 dark:border-emerald-800/30 bg-emerald-50/40 dark:bg-emerald-950/20 px-4 py-3">
			<div className="flex items-center gap-2 pb-0.5 border-b border-emerald-200/60 dark:border-emerald-800/30">
				<FileText className="h-3.5 w-3.5 text-emerald-500" />
				<span className="text-xs font-semibold text-foreground">
					Editar lección
				</span>
			</div>
			<div className="grid grid-cols-[1fr_auto] gap-2">
				<div>
					<label className={labelCls}>Título de la lección *</label>
					<input
						{...register("title")}
						placeholder="ej. Introducción al tema"
						className={smInputCls}
					/>
					{errors.title && (
						<p className="mt-0.5 text-xs text-destructive">
							{errors.title.message}
						</p>
					)}
				</div>
				<div>
					<label className={labelCls}>Tipo</label>
					<select
						{...register("lesson_type")}
						className="rounded border border-input bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
						{Object.entries(TYPE_LABELS).map(([val, lbl]) => (
							<option key={val} value={val}>
								{lbl}
							</option>
						))}
					</select>
				</div>
			</div>
			<div>
				<label className={labelCls}>Duración (minutos)</label>
				<input
					{...register("duration_seconds", { valueAsNumber: true })}
					type="number"
					min={0}
					placeholder="0"
					className={smInputCls}
				/>
			</div>
			<div className="flex justify-end gap-2">
				<button
					type="button"
					onClick={onDone}
					className="flex items-center gap-1 rounded px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors">
					<X className="h-3 w-3" /> Cancelar
				</button>
				<button
					type="submit"
					disabled={update.isPending}
					className="flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors">
					<Check className="h-3 w-3" /> Guardar cambios
				</button>
			</div>
		</form>
	);
}

// ── Lesson row ─────────────────────────────────────────────────────────────────
interface LessonRowProps {
	lesson: Lesson;
	moduleId: string;
	isFirst: boolean;
	isLast: boolean;
	onMoveUp: () => void;
	onMoveDown: () => void;
}

function LessonRow({
	lesson,
	moduleId,
	isFirst,
	isLast,
	onMoveUp,
	onMoveDown,
}: LessonRowProps) {
	const [editing, setEditing] = useState(false);
	const [resourcesOpen, setResourcesOpen] = useState(false);
	const deleteLesson = useDeleteLesson(moduleId);

	const durationStr = lesson.duration_seconds
		? `${Math.floor(lesson.duration_seconds / 60)}m ${lesson.duration_seconds % 60}s`
		: null;

	if (editing) {
		return (
			<div className="px-4 py-2">
				<LessonForm
					moduleId={moduleId}
					lesson={lesson}
					onDone={() => setEditing(false)}
				/>
			</div>
		);
	}

	return (
		<div className="border-b border-border/50 last:border-b-0">
			{/* Lesson header row */}
			<div className="flex items-center justify-between py-2 pr-2 pl-4 text-sm">
				{/* Left: chevron expander + lesson info */}
				<button
					onClick={() => setResourcesOpen((v) => !v)}
					className="flex min-w-0 flex-1 items-center gap-2 text-left hover:text-primary transition-colors"
					title={resourcesOpen ? "Ocultar recursos" : "Ver recursos"}>
					<ChevronRight
						className={cn(
							"h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-150",
							resourcesOpen && "rotate-90 text-amber-500",
						)}
					/>
					<FileText className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
					<span className="truncate text-foreground">{lesson.title}</span>
					<span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
						{TYPE_LABELS[lesson.lesson_type] ?? lesson.lesson_type}
					</span>
					{durationStr && (
						<span className="shrink-0 text-xs text-muted-foreground">
							{durationStr}
						</span>
					)}
					{lesson.drive_folder_url && (
						<a
							href={lesson.drive_folder_url}
							target="_blank"
							rel="noopener noreferrer"
							onClick={(e) => e.stopPropagation()}
							className="shrink-0 flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
							title="Abrir carpeta de Drive de esta lección">
							<FolderOpen className="h-3 w-3" />
							<span>Drive</span>
						</a>
					)}
				</button>
				{/* Right: reorder | edit | delete */}
				<div className="ml-2 flex shrink-0 items-center gap-0.5">
					<button
						onClick={onMoveUp}
						disabled={isFirst}
						className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
						title="Mover arriba">
						<ChevronUp className="h-3.5 w-3.5" />
					</button>
					<button
						onClick={onMoveDown}
						disabled={isLast}
						className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
						title="Mover abajo">
						<ChevronDown className="h-3.5 w-3.5" />
					</button>
					<span className="mx-1 h-3.5 w-px bg-border" />
					<button
						onClick={(e) => {
							e.stopPropagation();
							setEditing(true);
						}}
						className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
						title="Editar lección">
						<Pencil className="h-3.5 w-3.5" />
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							deleteLesson.mutate(lesson.id);
						}}
						className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
						title="Eliminar lección">
						<Trash2 className="h-3.5 w-3.5" />
					</button>
				</div>
			</div>
			{/* Resources panel — nested under the lesson */}
			{resourcesOpen && (
				<div className="ml-7 border-l-2 border-amber-200/70 dark:border-amber-700/30">
					<ResourcesSection lessonId={lesson.id} />
				</div>
			)}
		</div>
	);
}

// ── Lessons section ────────────────────────────────────────────────────────────
function LessonsSection({ moduleId }: { moduleId: string }) {
	const { data: lessonsRaw, isLoading } = useLessons(moduleId);
	const qc = useQueryClient();
	const [adding, setAdding] = useState(false);

	const lessons = [...(lessonsRaw ?? [])].sort(
		(a, b) => a.order_index - b.order_index,
	);

	const swapLesson = useMutation({
		mutationFn: async ([a, b]: [Lesson, Lesson]) => {
			await Promise.all([
				lessonsService.update(moduleId, a.id, { order_index: b.order_index }),
				lessonsService.update(moduleId, b.id, { order_index: a.order_index }),
			]);
		},
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: ["lessons", { moduleId }] }),
	});

	return (
		<div className="border-t border-border bg-muted/20">
			{/* Section header */}
			<div className="flex items-center gap-2 px-4 py-2 bg-emerald-50/40 dark:bg-emerald-950/10 border-b border-emerald-200/50 dark:border-emerald-800/20">
				<FileText className="h-3.5 w-3.5 text-emerald-500" />
				<span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
					Lecciones
				</span>
				{lessons.length > 0 && (
					<span className="ml-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 text-xs tabular-nums text-emerald-700 dark:text-emerald-400">
						{lessons.length}
					</span>
				)}
			</div>
			{isLoading && (
				<p className="px-4 py-2 text-xs text-muted-foreground">
					Cargando lecciones…
				</p>
			)}
			{lessons.map((lesson, i) => (
				<LessonRow
					key={lesson.id}
					lesson={lesson}
					moduleId={moduleId}
					isFirst={i === 0}
					isLast={i === lessons.length - 1}
					onMoveUp={() => swapLesson.mutate([lesson, lessons[i - 1]])}
					onMoveDown={() => swapLesson.mutate([lesson, lessons[i + 1]])}
				/>
			))}
			{lessons.length === 0 && !adding && !isLoading && (
				<p className="px-4 py-2 text-xs text-muted-foreground">
					Sin lecciones aún.
				</p>
			)}
			{adding && (
				<div className="px-4 py-2">
					<LessonCreateForm
						moduleId={moduleId}
						nextOrderIndex={lessons.length}
						onDone={() => setAdding(false)}
					/>
				</div>
			)}
			{!adding && (
				<button
					onClick={() => setAdding(true)}
					className="flex w-full items-center justify-center gap-2 border-t border-dashed border-emerald-200/70 dark:border-emerald-800/30 py-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20 transition-colors">
					<Plus className="h-3.5 w-3.5" /> Agregar lección
				</button>
			)}
		</div>
	);
}

// ── Module card ────────────────────────────────────────────────────────────────
interface ModuleCardProps {
	mod: Module;
	courseId: string;
	isFirst: boolean;
	isLast: boolean;
	onDelete: (id: string) => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
}

function ModuleCard({
	mod,
	courseId,
	isFirst,
	isLast,
	onDelete,
	onMoveUp,
	onMoveDown,
}: ModuleCardProps) {
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState(false);

	return (
		<div className="overflow-hidden rounded-lg border border-border border-l-4 border-l-primary bg-card">
			{editing ? (
				<div className="p-4">
					<ModuleForm
						courseId={courseId}
						module={mod}
						onDone={() => setEditing(false)}
					/>
				</div>
			) : (
				<div className="flex items-center gap-2 px-4 py-3">
					{/* Expand / title */}
					<button
						onClick={() => setOpen((v) => !v)}
						className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium text-foreground hover:text-primary transition-colors">
						<ChevronRight
							className={cn(
								"h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
								open && "rotate-90",
							)}
						/>
						<Layers className="h-4 w-4 shrink-0 text-primary/70" />
						<span className="flex-1 truncate">{mod.title}</span>
						{mod.description && (
							<span className="hidden max-w-xs truncate text-xs text-muted-foreground sm:block">
								{mod.description}
							</span>
						)}
						<span className="ml-auto shrink-0 pr-2 text-xs text-muted-foreground">
							#{mod.order_index + 1}
						</span>
					</button>
					<div className="flex shrink-0 items-center gap-0.5">
						{/* Reorder */}
						<button
							onClick={onMoveUp}
							disabled={isFirst}
							className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
							title="Mover módulo arriba">
							<ChevronUp className="h-4 w-4" />
						</button>
						<button
							onClick={onMoveDown}
							disabled={isLast}
							className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-30"
							title="Mover módulo abajo">
							<ChevronDown className="h-4 w-4" />
						</button>
						<span className="mx-1.5 h-4 w-px bg-border" />
						{/* Edit / delete */}
						<button
							onClick={() => setEditing(true)}
							className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
							title="Editar módulo">
							<Pencil className="h-4 w-4" />
						</button>
						<button
							onClick={() => onDelete(mod.id)}
							className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
							title="Eliminar módulo">
							<Trash2 className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}
			{open && !editing && <LessonsSection moduleId={mod.id} />}
		</div>
	);
}

// ── Modules tab (exported) ─────────────────────────────────────────────────────
export function ModulesTab({ courseId }: { courseId: string }) {
	const { data: modulesRaw, isLoading, isError } = useModules(courseId);
	const deleteModule = useDeleteModule(courseId);
	const qc = useQueryClient();
	const [adding, setAdding] = useState(false);

	const modules = [...(modulesRaw ?? [])].sort(
		(a, b) => a.order_index - b.order_index,
	);

	const swapModule = useMutation({
		mutationFn: async ([a, b]: [Module, Module]) => {
			await Promise.all([
				modulesService.update(courseId, a.id, { order_index: b.order_index }),
				modulesService.update(courseId, b.id, { order_index: a.order_index }),
			]);
		},
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: ["modules", { courseId }] }),
	});

	if (isLoading) {
		return <p className="text-sm text-muted-foreground">Cargando módulos…</p>;
	}
	if (isError) {
		return <p className="text-sm text-destructive">Error al cargar módulos.</p>;
	}

	return (
		<div className="space-y-3">
			{modules.map((mod, i) => (
				<ModuleCard
					key={mod.id}
					mod={mod}
					courseId={courseId}
					isFirst={i === 0}
					isLast={i === modules.length - 1}
					onDelete={(id) => deleteModule.mutate(id)}
					onMoveUp={() => swapModule.mutate([mod, modules[i - 1]])}
					onMoveDown={() => swapModule.mutate([mod, modules[i + 1]])}
				/>
			))}
			{modules.length === 0 && !adding && (
				<p className="text-sm text-muted-foreground">
					Este curso aún no tiene módulos.
				</p>
			)}
			{adding && (
				<ModuleForm
					courseId={courseId}
					nextOrderIndex={modules.length}
					onDone={() => setAdding(false)}
				/>
			)}
			{!adding && (
				<button
					onClick={() => setAdding(true)}
					className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
					<Plus className="h-4 w-4" /> Nuevo módulo
				</button>
			)}
		</div>
	);
}
