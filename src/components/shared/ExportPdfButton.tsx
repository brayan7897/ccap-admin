"use client";

import { FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface PdfColumn<TData> {
	header: string;
	accessor: (row: TData) => string | number;
}

interface ExportPdfButtonProps<TData> {
	title: string;
	subtitle?: string;
	columns: PdfColumn<TData>[];
	data: TData[];
	fileName: string;
	disabled?: boolean;
}

/**
 * Genera y descarga un PDF tabular a partir de un set de columnas y datos.
 * Pensado para los reportes administrativos (matrículas, certificados, etc.).
 */
export function ExportPdfButton<TData>({
	title,
	subtitle,
	columns,
	data,
	fileName,
	disabled,
}: ExportPdfButtonProps<TData>) {
	function handleExport() {
		const doc = new jsPDF({ orientation: "landscape" });

		doc.setFontSize(14);
		doc.text(title, 14, 15);

		if (subtitle) {
			doc.setFontSize(10);
			doc.setTextColor(100);
			doc.text(subtitle, 14, 21);
		}

		autoTable(doc, {
			startY: subtitle ? 26 : 22,
			head: [columns.map((col) => col.header)],
			body: data.map((row) => columns.map((col) => String(col.accessor(row) ?? "—"))),
			styles: { fontSize: 8 },
			headStyles: { fillColor: [37, 99, 235] },
		});

		const today = new Date().toISOString().slice(0, 10);
		doc.save(`${fileName}-${today}.pdf`);
	}

	return (
		<button
			type="button"
			onClick={handleExport}
			disabled={disabled || data.length === 0}
			className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40">
			<FileDown className="h-4 w-4" />
			Exportar PDF
		</button>
	);
}
