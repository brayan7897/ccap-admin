import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "CCAP Admin | Panel de Administración",
	description: "Panel administrativo de CCAP GLOBAL S.R.L.",
	icons: {
		icon: "/icon.svg",
		shortcut: "/icon.svg",
	},
};

// Inline script to prevent flash of wrong theme before React hydrates
const themeScript = `
(function() {
  try {
    var s = JSON.parse(localStorage.getItem('ccap-admin-ui') || '{}');
    if (s.state && s.state.darkMode) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="es" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body
				className={`${inter.variable} font-sans antialiased`}>
				<SessionProvider>
					<QueryProvider>
						<ThemeProvider>
							{children}
							<Toaster
								position="top-right"
								richColors
								closeButton
								toastOptions={{ duration: 4000 }}
							/>
						</ThemeProvider>
					</QueryProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
