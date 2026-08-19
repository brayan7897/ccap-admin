"use client";

import { useState } from "react";
import { KeyRound, X, Loader2, Eye, EyeOff } from "lucide-react";
import { Portal } from "@/components/shared/Portal";
import { useResetPassword } from "@/features/users/hooks/useUsers";
import type { User } from "@/types";

interface ResetPasswordModalProps {
	user: User | null;
	isOpen: boolean;
	onClose: () => void;
}

export function ResetPasswordModal({ user, isOpen, onClose }: ResetPasswordModalProps) {
	const resetPassword = useResetPassword();
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");

	if (!isOpen || !user) return null;

	const handleReset = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newPassword || !confirmPassword) return;
		if (newPassword.length < 8) {
			setError("La contraseña debe tener al menos 8 caracteres");
			return;
		}
		if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
			setError("Debe incluir mayúsculas, minúsculas y un número");
			return;
		}
		if (newPassword !== confirmPassword) {
			setError("Las contraseñas no coinciden");
			return;
		}
		setError("");

		resetPassword.mutate(
			{ userId: user.id, new_password: newPassword },
			{
				onSuccess: () => {
					setNewPassword("");
					setConfirmPassword("");
					setShowPassword(false);
					setShowConfirmPassword(false);
					onClose();
				},
			}
		);
	};

	return (
		<Portal>
			<div
				className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-0"
			>
				<div className="relative w-full max-w-sm rounded-xl border border-border bg-background shadow-xl animate-in fade-in zoom-in-95 duration-200">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
						<div className="flex items-center gap-2">
							<KeyRound className="h-5 w-5 text-foreground" />
							<h2 className="text-lg font-semibold text-foreground leading-tight">
								Cambiar Contraseña
							</h2>
						</div>
						<button
							onClick={onClose}
							disabled={resetPassword.isPending}
							className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					{/* Body */}
					<form onSubmit={handleReset}>
						<div className="px-6 py-5 space-y-4">
							<p className="text-sm text-muted-foreground">
								Establece una nueva contraseña para <strong>{user.email}</strong>.
							</p>

							{user.auth_provider === "google" && (
								<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-900/20">
									<p className="text-xs text-amber-700 dark:text-amber-400">
										Este usuario inició sesión con <strong>Google</strong> y no
										tiene contraseña local. Si continúas, se le habilitará
										también el inicio de sesión con email y contraseña además
										de Google.
									</p>
								</div>
							)}

							<div className="space-y-3">
								<div>
									<label className="text-xs font-medium text-foreground mb-1 block">
										Nueva contraseña
									</label>
									<div className="relative">
										<input
											type={showPassword ? "text" : "password"}
											className="w-full h-10 px-3 pr-10 rounded-md border border-input text-sm bg-background"
											placeholder="Ej: Temporal123!"
											value={newPassword}
											onChange={(e) => {
												setNewPassword(e.target.value);
												setError("");
											}}
											required
											disabled={resetPassword.isPending}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										>
											{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</button>
									</div>
								</div>

								<div>
									<label className="text-xs font-medium text-foreground mb-1 block">
										Confirmar contraseña
									</label>
									<div className="relative">
										<input
											type={showConfirmPassword ? "text" : "password"}
											className="w-full h-10 px-3 pr-10 rounded-md border border-input text-sm bg-background"
											placeholder="Repita la contraseña"
											value={confirmPassword}
											onChange={(e) => {
												setConfirmPassword(e.target.value);
												setError("");
											}}
											required
											disabled={resetPassword.isPending}
										/>
										<button
											type="button"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										>
											{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</button>
									</div>
								</div>

								{error && (
									<p className="text-xs text-destructive">{error}</p>
								)}
							</div>
						</div>

						{/* Footer Actions */}
						<div className="border-t border-border bg-muted/30 px-6 py-4 flex gap-2 justify-end">
							<button
								type="button"
								onClick={onClose}
								disabled={resetPassword.isPending}
								className="rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
							>
								Cancelar
							</button>
							<button
								type="submit"
								disabled={!newPassword || !confirmPassword || resetPassword.isPending}
								className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 min-w-[120px]"
							>
								{resetPassword.isPending ? (
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
