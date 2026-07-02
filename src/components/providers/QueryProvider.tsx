"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";

// Load devtools only in development — zero bundle cost in production
const ReactQueryDevtools =
	process.env.NODE_ENV === "development"
		? dynamic(
				() =>
					import("@tanstack/react-query-devtools").then(
						(m) => m.ReactQueryDevtools,
					),
				{ ssr: false },
			)
		: () => null;

export function QueryProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000, // 1 minute global default
						retry: 1,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
