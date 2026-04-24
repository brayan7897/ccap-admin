import { LoginForm } from "@/features/auth/components/LoginForm";
import Image from "next/image";
import { Suspense } from "react";

export default function LoginPage() {
	return (
		<main className="flex min-h-screen">
			{/* Left side: branding/logo side but with a dark elegant feel */}
			<div className="hidden lg:flex w-1/2 flex-col justify-center items-center bg-zinc-950 p-12 text-white relative overflow-hidden">
				{/* Background decorative elements */}
				<div className="absolute inset-0 z-0">
					<div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
					<div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-600/20 rounded-full blur-3xl opacity-50"></div>
				</div>

				<div className="relative z-10 flex flex-col items-center max-w-md text-center space-y-6">
					{/* Modern Logo placement. Adjust the src based on your actual logo image path */}
					<div className="h-24 w-auto mb-4 relative flex items-center justify-center">
						{/* Use a real logo or styled text */}
						<h1 className="text-5xl font-extrabold tracking-tighter text-white">
							CCAP <span className="text-primary">GLOBAL</span>
						</h1>
					</div>

					<p className="text-zinc-400 text-lg leading-relaxed">
						Sistema Integral de Gestión Académica y Administrativa de CCAP
						Global S.R.L.
					</p>
				</div>

				<div className="absolute bottom-10 left-10 text-xs font-mono text-zinc-600 uppercase tracking-widest">
					© {new Date().getFullYear()} CCAP GLOBAL S.R.L.
				</div>
			</div>

			{/* Right side: Login Panel */}
			<div className="flex w-full lg:w-1/2 items-center justify-center bg-background p-8 sm:p-12">
				<div className="w-full max-w-md space-y-8">
					<div className="flex flex-col space-y-2 text-center lg:text-left">
						{/* Mobile only logo/title */}
						<h1 className="text-3xl font-bold tracking-tight lg:hidden mb-2">
							CCAP <span className="text-primary">GLOBAL</span>
						</h1>

						<h2 className="text-3xl font-bold tracking-tight">
							Bienvenido de nuevo
						</h2>
						<p className="text-sm text-muted-foreground">
							Ingresa tus credenciales para acceder al panel administrativo
						</p>
					</div>

					<div className="mt-8">
						<Suspense>
							<LoginForm />
						</Suspense>
					</div>
				</div>
			</div>
		</main>
	);
}
