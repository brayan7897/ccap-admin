"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X, Star, ChevronDown, Search, Check } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import {
	testimonialSchema,
	type TestimonialInput,
} from "@/features/site/schemas/site.schema";
import { useAddTestimonial } from "@/features/site/hooks/useSite";
import { useUsersCatalog } from "@/hooks/useCatalog";
import { Portal } from "@/components/shared/Portal";

interface AddTestimonialModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function AddTestimonialModal({ isOpen, onClose }: AddTestimonialModalProps) {
	const addTestimonial = useAddTestimonial();
	const { users } = useUsersCatalog();

	const [selectedUserId, setSelectedUserId] = useState<string>("");

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm<TestimonialInput>({
		resolver: zodResolver(testimonialSchema),
		defaultValues: {
			user_name: "",
			text: "",
			rating: 5,
			user_image_url: "",
		},
	});

	const rating = watch("rating");
	const imageUrl = watch("user_image_url");

	const selectedUser = users.find((u) => u.id === selectedUserId);

	const [userSearch, setUserSearch] = useState("");
	const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const filteredUsers = useMemo(() => {
		const q = userSearch.toLowerCase().trim();
		if (!q) return users.slice(0, 50);
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

	if (!isOpen) return null;

	const onSubmit = async (data: TestimonialInput) => {
		try {
			await addTestimonial.mutateAsync(data);
			toast.success("Testimonio agregado correctamente");
			reset();
			setSelectedUserId("");
			onClose();
		} catch (error: any) {
			toast.error(error?.response?.data?.detail || "Error al agregar el testimonio.");
		}
	};

	return (
		<Portal>
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-md rounded-xl bg-background shadow-lg border">
				<div className="flex items-center justify-between border-b p-4">
					<h3 className="text-lg font-semibold">Nuevo Testimonio</h3>
					<button
						onClick={onClose}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors">
						<X className="h-4 w-4" />
					</button>
				</div>
				<form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
					<div className="space-y-2" ref={dropdownRef}>
						<label className="text-sm font-medium">Buscar Usuario (Autocompletar Datos)</label>
						<div className="relative">
							<button
								type="button"
								onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
								className={`flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${!selectedUser ? "text-muted-foreground" : ""}`}
							>
								{selectedUser ? (
									<span className="truncate">
										<span className="font-semibold text-foreground mr-1.5">{selectedUser.document_number}</span>
										{selectedUser.full_name || `${selectedUser.first_name} ${selectedUser.last_name}`.trim()}
									</span>
								) : (
									"Buscar usuario para autocompletar..."
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
									<div className="max-h-60 overflow-y-auto overscroll-contain p-1.5 scrollbar-thin">
										{filteredUsers.length === 0 ? (
											<div className="p-3 text-center text-sm text-muted-foreground">
												No se encontraron usuarios
											</div>
										) : (
											filteredUsers.map((u) => (
												<button
													key={u.id}
													type="button"
													onClick={() => {
														const fullName = u.full_name || `${u.first_name} ${u.last_name}`.trim();
														setSelectedUserId(u.id);
														setValue("user_name", fullName, { shouldValidate: true });
														if (u.avatar_url) {
															setValue("user_image_url", u.avatar_url, { shouldValidate: true });
														}
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
					</div>

					<div className="space-y-2">
						<label htmlFor="user_name" className="text-sm font-medium">Nombre a mostrar</label>
						<input
							id="user_name"
							{...register("user_name")}
							className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
							placeholder="Juan Pérez"
						/>
						{errors.user_name && <p className="text-xs text-destructive">{errors.user_name.message}</p>}
					</div>

					<div className="space-y-2">
						<label htmlFor="text" className="text-sm font-medium">Testimonio</label>
						<textarea
							id="text"
							{...register("text")}
							className="flex w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
							placeholder="Mi experiencia en CCAP fue excelente..."
						/>
						{errors.text && <p className="text-xs text-destructive">{errors.text.message}</p>}
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">Calificación</label>
						<div className="flex items-center gap-1">
							{[1, 2, 3, 4, 5].map((star) => (
								<button
									key={star}
									type="button"
									onClick={() => setValue("rating", star)}
									className={`p-1 rounded-md transition-colors hover:scale-110 ${
										star <= rating ? "text-yellow-400" : "text-muted"
									}`}
								>
									<Star className="h-6 w-6 fill-current" />
								</button>
							))}
						</div>
						{errors.rating && <p className="text-xs text-destructive">{errors.rating.message}</p>}
					</div>

					<div className="space-y-2">
						<label htmlFor="user_image_url" className="text-sm font-medium">Foto del Autor (Opcional URL)</label>
						<input
							id="user_image_url"
							{...register("user_image_url")}
							className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
							placeholder="https://..."
						/>
						{errors.user_image_url && <p className="text-xs text-destructive">{errors.user_image_url.message}</p>}
						
						{imageUrl && !errors.user_image_url && (
							<div className="mt-2 h-16 w-16 rounded-full overflow-hidden border">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img
									src={imageUrl}
									alt="Preview"
									className="h-full w-full object-cover"
									onError={(e) => {
										(e.target as HTMLImageElement).src =
											"https://via.placeholder.com/100x100?text=Error";
									}}
								/>
							</div>
						)}
					</div>

					<div className="flex justify-end gap-2 pt-4 border-t">
						<button
							type="button"
							onClick={onClose}
							disabled={addTestimonial.isPending}
							className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted">
							Cancelar
						</button>
						<button
							type="submit"
							disabled={addTestimonial.isPending}
							className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
							{addTestimonial.isPending ? "Guardando..." : "Agregar"}
						</button>
					</div>
				</form>
			</div>
			</div>
		</Portal>
	);
}
