"use client";

import { BtnMayor } from "@/components/ui/botones";

export function BotonImprimir() {
  return (
    <BtnMayor variante="secondary" tamano="sm" onClick={() => window.print()}>
      Imprimir entradas
    </BtnMayor>
  );
}
