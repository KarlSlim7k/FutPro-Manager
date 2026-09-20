"use client";

import { useRef, useState, useEffect } from "react";
import { PenTool, Check, RotateCcw, ShieldCheck, X } from "lucide-react";

interface DigitalSignaturePadProps {
  roleName: string;
  signatoryName: string;
  onSaveSignature: (signatureDataUrl: string) => void;
  existingSignatureUrl?: string | null;
}

export function DigitalSignaturePad({
  roleName,
  signatoryName,
  onSaveSignature,
  existingSignatureUrl,
}: DigitalSignaturePadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(existingSignatureUrl || null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (existingSignatureUrl) {
      setSignatureUrl(existingSignatureUrl);
    }
  }, [existingSignatureUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleConfirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;

    const dataUrl = canvas.toDataURL("image/png");
    setSignatureUrl(dataUrl);
    onSaveSignature(dataUrl);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col items-center">
      {signatureUrl ? (
        <div className="flex flex-col items-center group relative">
          <div className="h-16 w-32 relative flex items-center justify-center border-b border-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={signatureUrl} alt={`Firma ${roleName}`} className="max-h-full max-w-full object-contain" />
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5 print:hidden">
            <ShieldCheck className="h-3 w-3" />
            Firma digitalizada
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="text-[10px] text-zinc-500 hover:text-zinc-800 underline mt-0.5 print:hidden cursor-pointer"
          >
            Volver a firmar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="print:hidden inline-flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-600/50 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
        >
          <PenTool className="h-3.5 w-3.5" />
          Firmar con el dedo
        </button>
      )}

      {/* Signature Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm print:hidden">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-emerald-400" />
                  Rúbrica Táctil Digital
                </h3>
                <p className="text-xs text-zinc-400">
                  {roleName}: <strong className="text-emerald-300">{signatoryName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-900 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Traza tu firma con el dedo o stylus dentro del recuadro blanco:
            </p>

            <div className="rounded-xl border-2 border-dashed border-zinc-600 bg-white p-2 overflow-hidden shadow-inner">
              <canvas
                ref={canvasRef}
                width={360}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-40 touch-none cursor-crosshair bg-white"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={clearCanvas}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Limpiar trazo
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!hasDrawn}
                  onClick={handleConfirmSignature}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-40 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  Confirmar firma
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
