import { NextResponse } from 'next/server';

/**
 * GET /api/salud
 * Smoke test: verifica que el API esté arriba.
 */
export async function GET() {
  return NextResponse.json({ data: { ok: true, timestamp: new Date().toISOString() }, error: null });
}
