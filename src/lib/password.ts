import { hash, compare } from "bcryptjs";

/**
 * Utilidades de contraseña (bcrypt, pure JS — sin dependencias nativas).
 * Reemplazan el manejo de credenciales que hacía Supabase Auth.
 */

const RONDAS = 10;

export function hashPassword(plano: string): Promise<string> {
  return hash(plano, RONDAS);
}

export function verificarPassword(plano: string, hashGuardado: string): Promise<boolean> {
  return compare(plano, hashGuardado);
}
