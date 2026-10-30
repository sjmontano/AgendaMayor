"use client";

import { useState } from "react";
import { llamarApi } from "@/lib/api";

interface Resultado {
  codigo: string;
  evento: string;
  tipo: string;
  asistente: string;
}

/** Validación de entradas en la puerta: una entrada solo puede usarse una vez. */
export function ValidarEntrada() {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [error, setError] = useState("");

  async function validar(e: React.FormEvent) {
    e.preventDefault();
    setResultado(null);
    setError("");
    try {
      setResultado(await llamarApi<Resultado>("/api/entradas/validar", "POST", { codigo }));
      setCodigo("");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form className="formulario" onSubmit={validar}>
      <div className="campo">
        <label htmlFor="codigo">Código de la entrada</label>
        <input
          id="codigo"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          placeholder="ENT-XXXXXXXXXXXX"
          required
        />
      </div>
      <button className="btn btn-primario" type="submit">
        Validar
      </button>
      {error && <p className="alerta alerta--error">{error}</p>}
      {resultado && (
        <p className="alerta alerta--exito">
          ✓ Entrada válida: {resultado.asistente} — {resultado.tipo} ({resultado.evento})
        </p>
      )}
    </form>
  );
}
