"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { X, ChevronDown, Search, Check, GraduationCap } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import {
	featuredProfessorSchema,
	type FeaturedProfessorInput,
} from "@/features/site/schemas/site.schema";
import { useAddFeaturedProfessor } from "@/features/site/hooks/useSite";
import { useInstructorsCatalog } from "@/hooks/useCatalog";
import { Portal } from "@/components/shared/Portal";

interface AddProfessorModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function AddProfessorModal({ isOpen, onClose }: AddProfessorModalProps) {
	const addProfessor = useAddFeaturedProfessor();
	const { users, isLoading: instructorsLoading } = useInstructorsCatalog();

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setValue,
		formState: { errors },
	} = useForm<FeaturedProfessorInput>({
		resolver: zodResolver(featuredProfessorSchema),
		defaultValues: {
			user_id: "",
			specialization: "",
			image_url: "",
		},
	});

	const imageUrl = watch("image_url");
	const selectedUserId = watch("user_id");
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

	const onSubmit = async (data: FeaturedProfessorInput) => {
		// Strip empty strings so the API receives null/undefined for optional fields
		const payload: FeaturedProfessorInput = {
			user_id: data.user_id,
			...(data.specialization ? { specialization: data.specialization } : {}),
			...(data.image_url ? { image_url: data.image_url } : {}),
		};
		try {
			await addProfessor.mutateAsync(payload);
			toast.success("Profesor destacado agregado correctamente");
			reset();
			onClose();
		} catch (error: any) {
			toast.error(error?.response?.data?.detail || "Error al agregar el profesor.");
		}
	};

	return (
		<Portal>
			<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-md rounded-xl bg-background shadow-lg border">
				<div className="flex items-center justify-between border-b p-4">
					<h3 className="text-lg font-semibold">Agregar Profesor Destacado</h3>
					<button
						onClick={onClose}
						className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors">
						<X className="h-4 w-4" />
					</button>
				</div>
				<form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">

					{/* User Combobox */}
					<div className="space-y-2" ref={dropdownRef}>
						<label className="text-sm font-medium">Instructor *</label>
						<div className="relative">
							<button
								type="button"
								onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
								className={`flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${!selectedUser ? "text-muted-foreground" : ""}`}
							>
								{selectedUser ? (
									<span className="flex items-center gap-2 truncate">
										{selectedUser.avatar_url && (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={selectedUser.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover shrink-0" />
										)}
										<span className="truncate">
											<span className="font-semibold text-foreground mr-1.5">{selectedUser.document_number}</span>
											{selectedUser.full_name || `${selectedUser.first_name} ${selectedUser.last_name}`.trim()}
										</span>
									</span>
								) : (
									instructorsLoading ? "Cargando instructores…" : "Buscar instructor por DNI o Nombre..."
								)}
								<ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
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
												{instructorsLoading
													? "Cargando instructores…"
													: users.length === 0
													? "No hay usuarios con rol de Instructor registrados"
													: "No se encontraron instructores"}
											</div>
										) : (
											filteredUsers.map((u) => (
												<button
													key={u.id}
													type="button"
													onClick={() => {
														setValue("user_id", u.id, { shouldValidate: true });
														// Autocomplete image from avatar
														if (u.avatar_url) {
															setValue("image_url", u.avatar_url, { shouldValidate: false });
														}
														// Autocomplete specialization from bio
														if (u.bio) {
															setValue("specialization", u.bio, { shouldValidate: false });
														}
														setIsUserDropdownOpen(false);
														setUserSearch("");
													}}
													className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-left transition-colors hover:bg-accent hover:text-accent-foreground ${
														selectedUserId === u.id ? "bg-primary/10 text-primary font-medium" : ""
													}`}
												>
													{/* Avatar thumbnail */}
													<div className="h-9 w-9 rounded-full bg-muted border shrink-0 overflow-hidden flex items-center justify-center">
														{u.avatar_url ? (
															// eslint-disable-next-line @next/next/no-img-element
															<img src={u.avatar_url} alt="" className="h-full w-full object-cover" />
														) : (
															<GraduationCap className="h-4 w-4 text-muted-foreground" />
														)}
													</div>
													<div className="flex flex-col truncate flex-1">
														<span className="truncate font-medium text-foreground">
															{u.full_name || `${u.first_name} ${u.last_name}`.trim()}
														</span>
														<span className="text-xs text-muted-foreground truncate mt-0.5">
															DNI: {u.document_number} · {u.email}
														</span>
													</div>
													{selectedUserId === u.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
												</button>
											))
										)}
									</div>
								</div>
							)}
						</div>
						{errors.user_id && <p className="text-xs text-destructive">{errors.user_id.message}</p>}
					</div>

					{/* Specialization — optional, autocompleted from bio */}
					<div className="space-y-2">
						<label htmlFor="specialization" className="text-sm font-medium">
							Especialización <span className="text-muted-foreground font-normal">(Opcional)</span>
						</label>
						<input
							id="specialization"
							{...register("specialization")}
							className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
							placeholder="Ej: Desarrollo Web & Python"
						/>
						<p className="text-xs text-muted-foreground">Si seleccionas un usuario con bio, se autocompleta. El API usará este valor si lo proporcionas.</p>
					</div>

					{/* Image URL — optional, autocompleted from avatar */}
					<div className="space-y-2">
						<label htmlFor="image_url" className="text-sm font-medium">
							URL de Imagen <span className="text-muted-foreground font-normal">(Opcional)</span>
						</label>
						<input
							id="image_url"
							{...register("image_url")}
							className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary"
							placeholder="https://..."
						/>
						{errors.image_url && <p className="text-xs text-destructive">{errors.image_url.message}</p>}

						{imageUrl && !errors.image_url && (
							<div className="mt-2 h-24 w-24 rounded-full overflow-hidden border mx-auto">
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
							disabled={addProfessor.isPending}
							className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-muted">
							Cancelar
						</button>
						<button
							type="submit"
							disabled={addProfessor.isPending || !selectedUserId}
							className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none">
							{addProfessor.isPending ? "Guardando..." : "Agregar"}
						</button>
					</div>
				</form>
			</div>
			</div>
		</Portal>
	);
}
