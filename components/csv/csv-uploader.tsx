"use client";

import { useState } from "react";
import { Upload, Download, AlertCircle, CheckCircle2, FileText, Loader2 } from "lucide-react";

type CsvUploaderProps = {
  title: string;
  description: string;
  templateFileName: string;
  templateCsvContent: string;
  onImport: (content: string) => Promise<{ success: boolean; importedCount: number; errors: string[] }>;
  onSuccess?: () => void;
};

export function CsvUploader({
  title,
  description,
  templateFileName,
  templateCsvContent,
  onImport,
  onSuccess,
}: CsvUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>("");
  const [previewLines, setPreviewLines] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    importedCount: number;
    errors: string[];
  } | null>(null);

  const handleDownloadTemplate = () => {
    const blob = new Blob([templateCsvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", templateFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      setPreviewLines(lines.slice(0, 5));
    };
    reader.readAsText(selectedFile);
  };

  const handleExecuteImport = async () => {
    if (!csvContent) return;
    setIsProcessing(true);
    setImportResult(null);

    try {
      const res = await onImport(csvContent);
      setImportResult(res);
      if (res.success && onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado al importar";
      setImportResult({
        success: false,
        importedCount: 0,
        errors: [msg],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-6 text-zinc-100 shadow-xl backdrop-blur-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-emerald-400" />
            {title}
          </h2>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
        >
          <Download className="h-4 w-4 text-zinc-400" />
          Descargar plantilla (.csv)
        </button>
      </div>

      <div className="mt-6">
        <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-6 text-center cursor-pointer transition-colors hover:border-emerald-500/60 hover:bg-zinc-900">
          <FileText className="h-10 w-10 text-zinc-500 mb-2" />
          <span className="text-sm font-medium text-zinc-300">
            {file ? file.name : "Haz clic para seleccionar o arrastra tu archivo CSV"}
          </span>
          <span className="text-xs text-zinc-500 mt-1">Formato admitido: CSV separado por comas</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {previewLines.length > 0 && (
        <div className="mt-4 rounded-lg bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Vista previa de encabezado y primeras filas ({previewLines.length} filas detectadas):
          </p>
          <pre className="text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap p-2 rounded bg-black/40">
            {previewLines.join("\n")}
          </pre>
        </div>
      )}

      {importResult && (
        <div
          className={`mt-4 rounded-lg p-4 border ${
            importResult.success
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-red-950/40 border-red-800 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {importResult.success ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">
              {importResult.success
                ? `¡Importación completada! Se registraron ${importResult.importedCount} elementos exitosamente.`
                : "Hubo inconsistencias en el archivo CSV:"}
            </p>
          </div>
          {importResult.errors.length > 0 && (
            <ul className="mt-2 text-xs list-disc list-inside space-y-1 text-red-300/90 max-h-40 overflow-y-auto">
              {importResult.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={!file || isProcessing}
          onClick={handleExecuteImport}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando archivo...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Procesar e importar
            </>
          )}
        </button>
      </div>
    </div>
  );
}
