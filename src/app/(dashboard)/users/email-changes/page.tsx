"use client";

import { Loader2, Mail, Check, X } from "lucide-react";
import {
	usePendingEmailChanges,
	useUpdateEmail,
	useRejectEmailChange,
} from "@/features/users/hooks/useUsers";

export default function EmailChangesPage() {
	const { data: pendingRequests, isLoading, isError } = usePendingEmailChanges();
	const updateEmail = useUpdateEmail();
	const rejectEmailChange = useRejectEmailChange();

	const handleApprove = (userId: string, requestedEmail: string) => {
		updateEmail.mutate({ userId, new_email: requestedEmail });
	};

	const handleReject = (userId: string) => {
		if (window.confirm("¿Rechazar esta solicitud? El correo del usuario no cambiará.")) {
			rejectEmailChange.mutate(userId);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
					<Mail className="h-5 w-5" />
					Solicitudes de Cambio de Correo
				</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Revisa y aprueba (o rechaza) las solicitudes de los usuarios que quieren
					cambiar su correo de acceso.
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
						<div
							key={req.user_id}
							className="p-5 bg-card border border-border rounded-xl shadow-sm space-y-4"
						>
							<div>
								<h3 className="font-semibold text-foreground">
									{req.first_name} {req.last_name}
								</h3>
								<div className="text-sm text-muted-foreground mt-1 space-y-0.5">
									<p>
										Actual: <span className="text-foreground">{req.current_email}</span>
									</p>
									<p>
										Nuevo:{" "}
										<span className="font-medium text-foreground">
											{req.requested_email}
										</span>
									</p>
								</div>
								<p className="text-xs text-muted-foreground mt-1">
									Solicitado el: {new Date(req.requested_at).toLocaleString()}
								</p>
							</div>

							<div className="flex gap-2 pt-3 border-t border-border">
								<button
									onClick={() => handleReject(req.user_id)}
									disabled={rejectEmailChange.isPending}
									className="flex-1 py-1.5 px-3 rounded-md border border-input text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
								>
									<X className="h-3.5 w-3.5" />
									Rechazar
								</button>
								<button
									onClick={() => handleApprove(req.user_id, req.requested_email)}
									disabled={updateEmail.isPending}
									className="flex-1 py-1.5 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
								>
									<Check className="h-3.5 w-3.5" />
									{updateEmail.isPending ? "Guardando..." : "Aprobar"}
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
