import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { unauthorized } from "@/lib/errors";

/**
 * Sesión desde cookies — Adapter (capa de Infraestructura).
 * Lee la sesión que el middleware refresca en cada request.
 * En Route Handlers / Server Actions propaga los Set-Cookie de refresh;
 * en Server Components (solo lectura) el set se ignora de forma segura.
 */
export async function getSesionDesdeCookies(): Promise<{ userId: string; email: string }> {
  const jar = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              jar.set(name, value, options);
            });
          } catch {
            // Server Component de solo lectura: el proxy/middleware ya refrescó.
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw unauthorized("Sesión no válida o expirada");
  return { userId: user.id, email: user.email ?? "" };
}
