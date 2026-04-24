"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { useState } from "react";
import { Search } from "lucide-react";
import {
	notificationSchema,
	type NotificationInput,
} from "@/features/notifications/schemas/notification.schema";
import type { User } from "@/types";

const NOTIFICATION_TYPES = [
	{ value: "SYSTEM", label: "Sistema" },
	{ value: "COURSE_UPDATE", label: "Actualización de Curso" },
	{ value: "ACHIEVEMENT", label: "Logro" },
	{ value: "PROMOTION", label: "Promoción" },
	{ value: "REMINDER", label: "Recordatorio" },
] as const;

interface NotificationFormProps {
	onSubmit: (data: NotificationInput) => void;
	isLoading?: boolean;
	users?: User[];
}

export function NotificationForm({
	onSubmit,
	isLoading,
	users = [],
}: NotificationFormProps) {
	const [isGlobal, setIsGlobal] = useState(false);
	const [sendToAll, setSendToAll] = useState(true);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [userSearch, setUserSearch] = useState("");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<NotificationInput>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		resolver: zodResolver(notificationSchema) as Resolver<NotificationInput>,
		defaultValues: { type: "SYSTEM", target_user_ids: [] },
	});

	const field =
		"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

	const filteredUsers = users.filter((u) => {
		const name = (
			u.full_name || `${u.first_name} ${u.last_name}`
		).toLowerCase();
		const q = userSearch.toLowerCase();
		return name.includes(q) || u.email.toLowerCase().includes(q);
	});

	function toggleUser(id: string) {
		setSelectedIds((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
		);
	}

	function handleFormSubmit(data: NotificationInput) {
		onSubmit({
			...data,
			is_global: isGlobal,
			target_user_ids: isGlobal || sendToAll ? [] : selectedIds,
		});
	}

	return (
		<form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
			{/* Type */}
			<div className="space-y-1">
				<label className="text-sm font-medium">Tipo *</label>
				<select {...register("type")} className={field}>
					{NOTIFICATION_TYPES.map((t) => (
						<option key={t.value} value={t.value}>
							{t.label}
						</option>
					))}
				</select>
				{errors.type && (
					<p className="text-xs text-destructive">{errors.type.message}</p>
				)}
			</div>

			{/* Title */}
			<div className="space-y-1">
				<label className="text-sm font-medium">Título *</label>
				<input
					{...register("title")}
					placeholder="Título de la notificación"
					className={field}
				/>
				{errors.title && (
					<p className="text-xs text-destructive">{errors.title.message}</p>
				)}
			</div>

			{/* Message */}
			<div className="space-y-1">
				<label className="text-sm font-medium">Mensaje *</label>
				<textarea
					{...register("message")}
					rows={3}
					placeholder="Contenido de la notificación…"
					className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				/>
				{errors.message && (
					<p className="text-xs text-destructive">{errors.message.message}</p>
				)}
			</div>

			{/* Action URL */}
			<div className="space-y-1">
				<label className="text-sm font-medium">
					URL de acción{" "}
					<span className="text-xs text-muted-foreground">(opcional)</span>
				</label>
				<input
					{...register("action_url")}
					placeholder="https://…"
					className={field}
				/>
				{errors.action_url && (
					<p className="text-xs text-destructive">
						{errors.action_url.message}
					</p>
				)}
			</div>

			{/* Recipients */}
			<div className="space-y-2">
				<label className="text-sm font-medium">Envío</label>

				{/* Global broadcast toggle */}
				<label className="flex cursor-pointer items-start gap-3 rounded-md border border-input p-3 hover:bg-muted transition-colors">
					<input
						type="checkbox"
						checked={isGlobal}
						onChange={(e) => setIsGlobal(e.target.checked)}
						className="mt-0.5 h-4 w-4 shrink-0"
					/>
					<div>
						<p className="text-sm font-medium">Broadcast global</p>
						<p className="text-xs text-muted-foreground">
							Todos los usuarios ven esta notificación sin fan-out (recomendado
							para mantenimientos y anuncios generales).
						</p>
					</div>
				</label>

				{/* Per-user targeting — hidden when global */}
				{!isGlobal && (
					<div className="space-y-2">
						{/* "Send to all" toggle */}
						<label className="flex cursor-pointer items-center gap-2">
							<input
								type="checkbox"
								checked={sendToAll}
								onChange={(e) => {
									setSendToAll(e.target.checked);
									if (e.target.checked) setSelectedIds([]);
								}}
								className="h-4 w-4"
							/>
							<span className="text-sm">
								Enviar a todos los usuarios activos
							</span>
						</label>

						{/* User picker — only shown when not sending to all */}
						{!sendToAll && (
							<div className="overflow-hidden rounded-md border border-input">
								{/* Search bar */}
								<div className="relative border-b border-input bg-background px-3 py-2">
									<Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
									<input
										value={userSearch}
										onChange={(e) => setUserSearch(e.target.value)}
										placeholder="Buscar usuarios…"
										className="w-full bg-transparent pl-6 text-sm focus:outline-none"
									/>
								</div>

								{/* User list */}
								<div className="max-h-52 overflow-y-auto">
									{filteredUsers.length === 0 ? (
										<p className="px-3 py-4 text-center text-sm text-muted-foreground">
											No se encontraron usuarios.
										</p>
									) : (
										filteredUsers.map((u) => (
											<label
												key={u.id}
												className="flex cursor-pointer items-center gap-3 border-b border-input/40 px-3 py-2 last:border-0 hover:bg-muted">
												<input
													type="checkbox"
													checked={selectedIds.includes(u.id)}
													onChange={() => toggleUser(u.id)}
													className="h-4 w-4 shrink-0"
												/>
												<div className="min-w-0">
													<p className="truncate text-sm font-medium">
														{u.full_name || `${u.first_name} ${u.last_name}`}
													</p>
													<p className="truncate text-xs text-muted-foreground">
														{u.email}
													</p>
												</div>
											</label>
										))
									)}
								</div>

								{/* Selection count */}
								{selectedIds.length > 0 && (
									<p className="border-t border-input bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
										{selectedIds.length} usuario
										{selectedIds.length !== 1 ? "s" : ""} seleccionado
										{selectedIds.length !== 1 ? "s" : ""}
									</p>
								)}
							</div>
						)}
					</div>
				)}
			</div>

			<button
				type="submit"
				disabled={isLoading}
				className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
				{isLoading ? "Enviando…" : "Enviar notificación"}
			</button>
		</form>
	);
}
