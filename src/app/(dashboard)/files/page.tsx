"use client";

import { filesService } from "@/features/files/services/files.service";
import type { DriveFile } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, FileText, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

function FilesGrid({ files }: { files: DriveFile[] }) {
	if (files.length === 0) {
		return (
			<p className="text-sm text-muted-foreground">
				No hay archivos disponibles.
			</p>
		);
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
			{files.map((f) => (
				<div
					key={f.id}
					className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-muted p-2">
							<FileText className="h-5 w-5 text-primary" />
						</div>
						<div className="min-w-0">
							<p className="truncate text-sm font-medium text-foreground">
								{f.name}
							</p>
							<p className="text-xs text-muted-foreground">{f.mimeType}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{f.webViewLink && (
							<a
								href={f.webViewLink}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
								<ExternalLink className="h-3.5 w-3.5" />
								Ver
							</a>
						)}
						<button
							onClick={() =>
								filesService
									.delete(f.id)
									.then(() => toast.success("Archivo eliminado."))
									.catch(() => toast.error("Error al eliminar el archivo."))
							}
							className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
							<Trash2 className="h-3.5 w-3.5" />
							Eliminar
						</button>
					</div>
				</div>
			))}
		</div>
	);
}

interface UploadState {
	uploading: boolean;
	progress: number;
	fileName: string;
}

export default function FilesPage() {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["files"],
		queryFn: filesService.getAll,
	});

	const inputRef = useRef<HTMLInputElement>(null);
	const [uploadState, setUploadState] = useState<UploadState>({
		uploading: false,
		progress: 0,
		fileName: "",
	});

	const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploadState({ uploading: true, progress: 0, fileName: file.name });

		try {
			await filesService.upload(file, undefined, (percent) => {
				setUploadState((prev) => ({ ...prev, progress: percent }));
			});
			// El XHR marca 100% cuando los bytes llegaron al servidor;
			// éste aún puede estar procesando. Mantenemos la barra en 100
			// un instante para que se vea completa antes de cerrar.
			setUploadState((prev) => ({ ...prev, progress: 100 }));
			await new Promise((r) => setTimeout(r, 700));
			toast.success(`"${file.name}" subido correctamente.`);
			refetch();
		} catch {
			toast.error("Error al subir el archivo.");
		} finally {
			setUploadState({ uploading: false, progress: 0, fileName: "" });
			if (inputRef.current) inputRef.current.value = "";
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-foreground">Archivos</h2>
					<p className="text-sm text-muted-foreground">
						Gestiona los archivos almacenados en Google Drive vía la API.
					</p>
				</div>
				<button
					onClick={() => inputRef.current?.click()}
					disabled={uploadState.uploading}
					className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
					<Upload className="h-4 w-4" />
					Subir archivo
				</button>
				<input
					ref={inputRef}
					type="file"
					className="hidden"
					onChange={handleUpload}
				/>
			</div>

			{/* Barra de progreso real — solo visible mientras se sube */}
			{uploadState.uploading && (
				<div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="font-medium text-foreground truncate max-w-[70%]">
							Subiendo: {uploadState.fileName}
						</span>
						<span className="tabular-nums font-semibold text-primary">
							{uploadState.progress}%
						</span>
					</div>
					<div className="h-2 w-full rounded-full bg-muted overflow-hidden">
						<div
							className="h-full rounded-full bg-primary transition-all duration-150 ease-out"
							style={{ width: `${uploadState.progress}%` }}
						/>
					</div>
					<p className="text-xs text-muted-foreground">
						{uploadState.progress < 100
							? "Transfiriendo bytes al servidor…"
							: "Procesando en el servidor…"}
					</p>
				</div>
			)}

			{isLoading && (
				<p className="text-sm text-muted-foreground">Cargando archivos…</p>
			)}
			{isError && (
				<p className="text-sm text-destructive">
					Error al cargar archivos. Verifica que la API esté disponible.
				</p>
			)}

			{data && <FilesGrid files={data} />}
		</div>
	);
}
