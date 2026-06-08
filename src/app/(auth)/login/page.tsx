import { LoginForm } from "@/features/auth/components/LoginForm";
import { Logo } from "@/components/ui/Logo";
import { Suspense } from "react";

export default function LoginPage() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 sm:p-8 relative overflow-hidden">
			{/* Background decorative elements */}
			<div className="absolute inset-0 z-0 pointer-events-none">
				<div className="absolute top-1/4 -left-1/4 w-[80%] h-[80%] max-w-3xl max-h-3xl bg-primary/20 rounded-full blur-[120px] opacity-50 animate-in fade-in duration-[2000ms]"></div>
				<div className="absolute bottom-1/4 -right-1/4 w-[80%] h-[80%] max-w-3xl max-h-3xl bg-blue-600/20 rounded-full blur-[120px] opacity-40 animate-in fade-in duration-[2000ms] delay-500"></div>
			</div>

			<div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-1000">
				<div className="bg-background/95 dark:bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
					{/* Header / Logo section */}
					<div className="px-8 pt-10 pb-6 flex flex-col items-center border-b border-border/50">
						<div className="h-16 w-auto mb-6 transform transition-transform hover:scale-105 duration-500">
							<Logo className="h-full w-auto" variant="default" />
						</div>
						
						<div className="flex flex-col space-y-2 text-center">
							<h2 className="text-2xl font-bold tracking-tight text-foreground">
								Bienvenido de nuevo
							</h2>
							<p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
								Ingresa tus credenciales para acceder al panel administrativo
							</p>
						</div>
					</div>

					{/* Form Section */}
					<div className="p-8">
						<Suspense fallback={
							<div className="flex justify-center items-center py-8 animate-in fade-in zoom-in duration-300">
								<div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
							</div>
						}>
							<LoginForm />
						</Suspense>
					</div>
					
					{/* Footer */}
					<div className="bg-muted/30 px-8 py-4 text-center border-t border-border/50">
						<p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
							© {new Date().getFullYear()} CCAP GLOBAL S.R.L.
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}
