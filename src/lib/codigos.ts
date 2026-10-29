import { createHash, randomBytes } from "crypto";

/** Código público legible (orden, entrada). No es un secreto. */
export function codigoPublico(prefijo: string) {
  return `${prefijo}-${randomBytes(6).toString("hex").toUpperCase()}`;
}

/** Token de acceso a una orden. Solo se guarda su hash en la base de datos. */
export function tokenSeguro() {
  return randomBytes(24).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
