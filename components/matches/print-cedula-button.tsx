"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintCedulaButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white print:hidden"
    >
      <Printer className="h-4 w-4" />
      <span>Imprimir Cédula / Guardar PDF</span>
    </Button>
  );
}
