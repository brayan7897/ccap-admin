"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "../schemas/login.schema";

export function LoginForm() {
	const searchParams = useSearchParams();
	const [loading, setLoading] = useState(false);

	// Query-param driven banners
	const studentBlocked = searchParams.get("blocked") === "student";
	const sessionDisplaced = searchParams.get("reason") === "session_displaced";

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginInput>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginInput) => {
		setLoading(true);
		const result = await signIn("credentials", {
			email: data.email,
			password: data.password,
			redirect: false,
		});
		setLoading(false);

		if (result?.error) {
			const code = result.error;

			if (code.startsWith("student_blocked")) {
				toast.error("Acceso denegado: esta cuenta tiene rol de estudiante.");
			} else if (code.includes("login_failed_401") || code.includes("login_failed_403")) {
				toast.error("Credenciales incorrectas. Verifica tu email y contraseña.");
			} else if (code.includes("login_failed_")) {
				toast.error("El servidor rechazó el inicio de sesión. Intenta más tarde.");
			} else {
				toast.error("Error al iniciar sesión. Intenta de nuevo.");
			}
			return;
		}

		// Full page navigation ensures the middleware reads the fresh session cookie
		window.location.href = "/";
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			{/* Banner: student blocked */}
			{studentBlocked && (
				<div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
					Tu cuenta no tiene permisos para acceder al panel administrativo.
					Contacta a un administrador.
				</div>
			)}

			{/* Banner: displaced session */}
			{sessionDisplaced && (
				<div className="rounded-md bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
					Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo.
					Inicia sesión nuevamente para continuar.
				</div>
			)}

			<div className="space-y-1">
				<label htmlFor="email" className="text-sm font-medium text-foreground">
					Email
				</label>
				<input
					id="email"
					type="email"
					autoComplete="email"
					placeholder="admin@ccap.com"
					{...register("email")}
					className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				/>
				{errors.email && (
					<p className="text-xs text-destructive">{errors.email.message}</p>
				)}
			</div>

			{/* Password */}
			<div className="space-y-1">
				<label
					htmlFor="password"
					className="text-sm font-medium text-foreground">
					Contraseña
				</label>
				<input
					id="password"
					type="password"
					autoComplete="current-password"
					placeholder="••••••••"
					{...register("password")}
					className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				/>
				{errors.password && (
					<p className="text-xs text-destructive">{errors.password.message}</p>
				)}
			</div>

			{/* Submit */}
			<button
				type="submit"
				disabled={loading}
				className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
				{loading ? "Iniciando sesión…" : "Iniciar sesión"}
			</button>
		</form>
	);
}
