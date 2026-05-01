"use client";

import { useState } from "react";
import { Loader2, KeyRound } from "lucide-react";
import { usePendingPasswordResets, useResetPassword } from "@/features/users/hooks/useUsers";

export default function PasswordResetsPage() {
	const { data: pendingRequests, isLoading, isError } = usePendingPasswordResets();
	const resetPassword = useResetPassword();

	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [newPassword, setNewPassword] = useState("");

	const handleReset = (userId: string) => {
		if (!newPassword) return;
		resetPassword.mutate(
			{ userId, new_password: newPassword },
			{
				onSuccess: () => {
					setSelectedUserId(null);
					setNewPassword("");
				},
			}
		);
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
					<KeyRound className="h-5 w-5" />
					Solicitudes de Restablecimiento de Contraseña
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Revisa y procesa las solicitudes de los usuarios que olvidaron su contraseña.
				</p>
			</div>

			{isLoading && (
				<div className="flex items-center justify-center p-8">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			)}

			{isError && (
				<p className="text-sm text-destructive">
					Error al cargar las solicitudes pendientes.
				</p>
			)}

			{!isLoading && !isError && pendingRequests?.length === 0 && (
				<div className="p-8 text-center bg-card rounded-xl border border-border">
					<p className="text-muted-foreground">No hay solicitudes pendientes en este momento.</p>
				</div>
			)}

			{!isLoading && !isError && pendingRequests && pendingRequests.length > 0 && (
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{pendingRequests.map((req) => (
						<div key={req.user_id} className="p-5 bg-card border border-border rounded-xl shadow-sm space-y-4">
							<div>
								<h3 className="font-semibold text-foreground">
									{req.first_name} {req.last_name}
								</h3>
								<p className="text-sm text-muted-foreground">{req.email}</p>
								<p className="text-xs text-muted-foreground mt-1">
									Solicitado el: {new Date(req.requested_at).toLocaleString()}
								</p>
							</div>

							{selectedUserId === req.user_id ? (
								<div className="space-y-3 pt-3 border-t border-border">
									<div>
										<label className="text-xs font-medium text-foreground mb-1 block">
											Nueva contraseña
										</label>
										<input
											type="text"
											className="w-full h-9 px-3 rounded-md border border-input text-sm"
											placeholder="Ej: Temporal123!"
											value={newPassword}
											onChange={(e) => setNewPassword(e.target.value)}
										/>
									</div>
									<div className="flex gap-2">
										<button
											onClick={() => {
												setSelectedUserId(null);
												setNewPassword("");
											}}
											className="flex-1 py-1.5 px-3 rounded-md border border-input text-xs font-medium hover:bg-muted transition-colors">
											Cancelar
										</button>
										<button
											onClick={() => handleReset(req.user_id)}
											disabled={!newPassword || resetPassword.isPending}
											className="flex-1 py-1.5 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
											{resetPassword.isPending && selectedUserId === req.user_id ? "Guardando..." : "Guardar"}
										</button>
									</div>
								</div>
							) : (
								<button
									onClick={() => {
										setSelectedUserId(req.user_id);
										setNewPassword("");
									}}
									className="w-full py-2 rounded-md bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
									Asignar nueva contraseña
								</button>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
