"use client";

import { useState, useEffect } from "react";
import { Mail, X, Loader2 } from "lucide-react";
import { Portal } from "@/components/shared/Portal";
import { useUpdateEmail } from "@/features/users/hooks/useUsers";
import type { User } from "@/types";

interface ChangeEmailModalProps {
	user: User | null;
	isOpen: boolean;
	onClose: () => void;
	/** Pre-fills the new-email field — used when approving a pending self-service request. */
	prefillEmail?: string;
}

export function ChangeEmailModal({ user, isOpen, onClose, prefillEmail }: ChangeEmailModalProps) {
	const updateEmail = useUpdateEmail();
	const [newEmail, setNewEmail] = useState("");

	useEffect(() => {
		if (isOpen) setNewEmail(prefillEmail ?? "");
	}, [isOpen, prefillEmail]);

	if (!isOpen || !user) return null;

	const isGoogleLinked = user.auth_provider === "google";

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newEmail || isGoogleLinked) return;

		updateEmail.mutate(
			{ userId: user.id, new_email: newEmail },
			{ onSuccess: () => { setNewEmail(""); onClose(); } },
		);
	};

	return (
		<Portal>
			<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0">
				<div className="relative w-full max-w-sm rounded-xl border border-border bg-background shadow-xl animate-in fade-in zoom-in-95 duration-200">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
						<div className="flex items-center gap-2">
							<Mail className="h-5 w-5 text-foreground" />
							<h2 className="text-lg font-semibold text-foreground leading-tight">
								Cambiar Correo
							</h2>
						</div>
						<button
							onClick={onClose}
							disabled={updateEmail.isPending}
							className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					{/* Body */}
					<form onSubmit={handleSubmit}>
						<div className="px-6 py-5 space-y-4">
							<p className="text-sm text-muted-foreground">
								Correo actual: <strong>{user.email}</strong>.
							</p>

							{isGoogleLinked ? (
								<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
									<p className="text-xs text-amber-700 dark:text-amber-400">
										Este usuario inició sesión con <strong>Google</strong>. Su
										correo se sincroniza con su cuenta de Google y no se puede
										cambiar desde aquí.
									</p>
								</div>
							) : (
								<>
									<div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-900/20">
										<p className="text-xs text-blue-700 dark:text-blue-400">
											El cambio se aplica de inmediato y se cierran todas las
											sesiones activas del usuario — deberá iniciar sesión de
											nuevo con el correo nuevo.
										</p>
									</div>
									<div>
										<label className="text-xs font-medium text-foreground mb-1 block">
											Correo nuevo
										</label>
										<input
											type="email"
											className="w-full h-10 px-3 rounded-md border border-input text-sm bg-background"
											placeholder="nuevo@correo.com"
											value={newEmail}
											onChange={(e) => setNewEmail(e.target.value)}
											required
											disabled={updateEmail.isPending}
										/>
									</div>
								</>
							)}
						</div>

						{/* Footer Actions */}
						<div className="border-t border-border bg-muted/30 px-6 py-4 flex gap-2 justify-end">
							<button
								type="button"
								onClick={onClose}
								disabled={updateEmail.isPending}
								className="rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
							>
								Cancelar
							</button>
							<button
								type="submit"
								disabled={!newEmail || isGoogleLinked || updateEmail.isPending}
								className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 min-w-[120px]"
							>
								{updateEmail.isPending ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									"Guardar cambios"
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</Portal>
	);
}
