"use client";

import { DataTable } from "@/components/tables/DataTable";
import { buildModulesColumns } from "@/components/tables/columns/modules-columns";
import { useModules } from "@/features/modules/hooks/useModules";
import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ModulesContent() {
const searchParams = useSearchParams();
const courseId = searchParams.get("courseId") ?? "";

const { data, isLoading, isError } = useModules(courseId);
const columns = useMemo(() => buildModulesColumns(() => {}), []);

if (!courseId) {
return (
<p className="text-sm text-muted-foreground">
Selecciona un curso para ver sus módulos.
</p>
);
}

return (
<>
{isLoading && (
<p className="text-sm text-muted-foreground">Cargando módulos…</p>
)}
{isError && (
<p className="text-sm text-destructive">
Error al cargar módulos. Verifica que la API esté disponible.
</p>
)}
{!isLoading && (
<DataTable
columns={columns}
data={data ?? []}
searchPlaceholder="Buscar módulos…"
/>
)}
</>
);
}

export default function ModulesPage() {
return (
<div className="space-y-6">
<div>
<h2 className="text-xl font-semibold text-foreground">Módulos</h2>
<p className="text-sm text-muted-foreground">
Administra los módulos de los cursos.
</p>
</div>
<Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
<ModulesContent />
</Suspense>
</div>
);
}
