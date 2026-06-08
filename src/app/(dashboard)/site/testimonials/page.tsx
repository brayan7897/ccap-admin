"use client";

import { useState } from "react";
import { Plus, Trash2, User, Star } from "lucide-react";
import {
	useTestimonials,
	useRemoveTestimonial,
	useToggleFeaturedTestimonial,
} from "@/features/site/hooks/useSite";
import { AddTestimonialModal } from "./_components/AddTestimonialModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TestimonialsPage() {
	const { data, isLoading, isError } = useTestimonials();
	const removeTestimonial = useRemoveTestimonial();
	const toggleFeatured = useToggleFeaturedTestimonial();
	const [isModalOpen, setIsModalOpen] = useState(false);

	const maxFeatured = 5;
	const featuredCount = data?.filter((t) => t.is_featured).length || 0;

	const handleDelete = async (id: string) => {
		if (confirm("¿Estás seguro de eliminar este testimonio?")) {
			try {
				await removeTestimonial.mutateAsync(id);
				toast.success("Testimonio eliminado exitosamente");
			} catch (error) {
				toast.error("Error al eliminar el testimonio");
			}
		}
	};

	const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
		if (!currentStatus && featuredCount >= maxFeatured) {
			toast.error(`Solo puedes destacar un máximo de ${maxFeatured} testimonios.`);
			return;
		}

		try {
			await toggleFeatured.mutateAsync({ id, featured: !currentStatus });
			toast.success(currentStatus ? "Testimonio removido de la portada" : "Testimonio destacado en portada");
		} catch (error: any) {
			toast.error(error?.response?.data?.detail || "Error al cambiar el estado");
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Testimonios</h2>
					<p className="text-sm text-muted-foreground">
						Los usuarios registran sus testimonios desde la plataforma. Aquí gestionas cuáles se destacan en la portada ({featuredCount}/{maxFeatured} destacados).
					</p>
				</div>
				<button
					onClick={() => setIsModalOpen(true)}
					className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
					<Plus className="h-4 w-4" />
					Agregar Manualmente
				</button>
			</div>

			{isLoading && <p className="text-sm text-muted-foreground">Cargando testimonios...</p>}
			{isError && (
				<div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
					Ocurrió un error al cargar la información.
				</div>
			)}

			{!isLoading && !isError && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
					{data?.map((testimonial) => (
						<div key={testimonial.id} className={cn("rounded-xl border bg-card p-6 flex flex-col shadow-sm relative group", testimonial.is_featured && "border-primary/50 shadow-primary/10")}>
							<div className="flex justify-between items-start mb-4">
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-full overflow-hidden bg-muted border flex items-center justify-center shrink-0">
										{testimonial.user_image_url ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={testimonial.user_image_url} alt={testimonial.user_name} className="h-full w-full object-cover" />
										) : (
											<User className="h-5 w-5 text-muted-foreground" />
										)}
									</div>
									<div>
										<h3 className="font-semibold text-sm leading-none">{testimonial.user_name}</h3>
										<div className="flex items-center gap-0.5 mt-1">
											{Array.from({ length: 5 }).map((_, i) => (
												<Star key={i} className={cn("h-3 w-3", i < testimonial.rating ? "text-yellow-400 fill-current" : "text-muted stroke-muted-foreground")} />
											))}
										</div>
									</div>
								</div>
							</div>

							<p className="text-sm text-muted-foreground flex-1 italic mb-4">"{testimonial.text}"</p>

							<div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
								<label className="flex items-center gap-2 cursor-pointer">
									<input
										type="checkbox"
										checked={testimonial.is_featured}
										onChange={() => handleToggleFeatured(testimonial.id, testimonial.is_featured)}
										className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
										disabled={toggleFeatured.isPending}
									/>
									<span className="text-xs font-medium">Destacar en portada</span>
								</label>
								<button
									onClick={() => handleDelete(testimonial.id)}
									className="p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
									title="Eliminar testimonio"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						</div>
					))}

					{data?.length === 0 && (
						<div className="col-span-full py-12 text-center text-sm text-muted-foreground bg-card border border-dashed rounded-xl">
							No hay testimonios registrados actualmente.
						</div>
					)}
				</div>
			)}

			<AddTestimonialModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
		</div>
	);
}
