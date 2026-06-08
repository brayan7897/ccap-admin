"use client";

import { useState } from "react";
import { Plus, Trash2, User } from "lucide-react";
import {
	useFeaturedProfessors,
	useRemoveFeaturedProfessor,
} from "@/features/site/hooks/useSite";
import { AddProfessorModal } from "./_components/AddProfessorModal";
import { toast } from "sonner";

export default function FeaturedProfessorsPage() {
	const { data, isLoading, isError } = useFeaturedProfessors();
	const removeProfessor = useRemoveFeaturedProfessor();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const maxProfessors = 3;
	const currentCount = data?.length || 0;
	const canAddMore = currentCount < maxProfessors;

	const handleDelete = async (id: string) => {
		if (confirm("¿Estás seguro de eliminar a este profesor de los destacados?")) {
			try {
				await removeProfessor.mutateAsync(id);
				toast.success("Profesor removido exitosamente");
			} catch (error) {
				toast.error("Error al remover al profesor");
			}
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Profesores Destacados</h2>
					<p className="text-sm text-muted-foreground">
						Selecciona hasta {maxProfessors} profesores para mostrar en la página principal.
						({currentCount}/{maxProfessors})
					</p>
				</div>
				<button
					onClick={() => setIsModalOpen(true)}
					disabled={!canAddMore}
					className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50">
					<Plus className="h-4 w-4" />
					Agregar Profesor
				</button>
			</div>

			{isLoading && <p className="text-sm text-muted-foreground">Cargando profesores destacados...</p>}
			{isError && (
				<div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
					Ocurrió un error al cargar la información.
				</div>
			)}

			{!isLoading && !isError && (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
					{data?.map((prof) => (
						<div key={prof.id} className="rounded-xl border bg-card p-6 flex flex-col items-center text-center shadow-sm relative group">
							<button
								onClick={() => handleDelete(prof.id)}
								className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors opacity-0 group-hover:opacity-100"
								title="Remover destacado"
							>
								<Trash2 className="h-4 w-4" />
							</button>

							<div className="h-24 w-24 rounded-full overflow-hidden bg-muted mb-4 border-2 border-border flex items-center justify-center">
								{prof.image_url ? (
									// eslint-disable-next-line @next/next/no-img-element
									<img
										src={prof.image_url}
										alt={prof.name}
										className="h-full w-full object-cover"
									/>
								) : (
									<User className="h-10 w-10 text-muted-foreground" />
								)}
							</div>
							<h3 className="font-semibold text-lg">{prof.name}</h3>
							<p className="text-sm text-muted-foreground mt-1">{prof.specialization}</p>
						</div>
					))}

					{data?.length === 0 && (
						<div className="col-span-full py-12 text-center text-sm text-muted-foreground bg-card border border-dashed rounded-xl">
							No hay profesores destacados actualmente.
						</div>
					)}
				</div>
			)}

			<AddProfessorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
		</div>
	);
}
