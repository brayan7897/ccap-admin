import { Suspense } from "react";
import { UsersPageClient } from "./UsersPageClient";

export default function UsersPage() {
	return (
		<Suspense fallback={<p className="text-sm text-muted-foreground">Cargando usuarios…</p>}>
			<UsersPageClient />
		</Suspense>
	);
}
