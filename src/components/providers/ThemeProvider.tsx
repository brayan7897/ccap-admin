"use client";

import { useEffect } from "react";
import { useUiStore } from "@/store/ui-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const darkMode = useUiStore((s) => s.darkMode);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", darkMode);
	}, [darkMode]);

	return <>{children}</>;
}
