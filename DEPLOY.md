# Deploy — Agenda Mayor

## Variables de entorno (requeridas)

| Variable | Descripción | Dónde obtenerla |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key (pública) | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (secreta, solo server) | Supabase Dashboard → Settings → API |

---

## Opción A: Vercel (recomendada)

1. Subir el repo a GitHub
2. Ir a [vercel.com/new](https://vercel.com/new)
3. Importar el repositorio
4. Vercel detecta Next.js automáticamente — no necesita configuración
5. Agregar las 3 variables de entorno en **Settings → Environment Variables**
6. Deploy

**Pros:** zero-config, edge functions, analytics, previews por PR.

---

## Opción B: Render

1. Subir el repo a GitHub
2. Ir a [render.com](https://render.com) → **New Web Service**
3. Conectar el repo
4. Configuración:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Agregar las variables de entorno
6. Deploy

**Alternativa:** usar `render.yaml` (Blueprint) para configuración automática.

---

## Opción C: Docker (cualquier proveedor)

```bash
# Build
docker build -t agenda-mayor .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... \
  -e SUPABASE_SERVICE_ROLE_KEY=eyJ... \
  agenda-mayor
```

---

## Post-deploy

1. Ejecutar la migración SQL en Supabase:
   - Ir a SQL Editor → pegar contenido de `supabase/migrations/0001_mvp.sql`
   - Pegar contenido de `supabase/seed.sql`
2. Verificar: `GET /api/salud` debe retornar `{"data":"ok"}`
3. Crear cuenta de admin en `/registro` y cambiar su rol a ADMIN en la BD
4. Importar eventos: `POST /api/admin/importar-eventos` (como ADMIN)
