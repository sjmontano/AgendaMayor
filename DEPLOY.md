# Deploy — Agenda Mayor

## Preparar la base de datos (Neon)

1. Crear un proyecto en [neon.tech](https://neon.tech).
2. Copiar las dos cadenas de conexión desde **Dashboard → Connection string**:
   - **Pooled** → `DATABASE_URL` (host con `-pooler`).
   - **Direct** → `DIRECT_URL` (host sin `-pooler`, la usan las migraciones).
3. Crear las tablas y sembrar roles/usuarios:

```bash
npx prisma db push      # crea el esquema en Postgres
npx prisma db seed      # roles + usuarios demo (contraseña: Unimayor2026)
```

> Opcional: `npx prisma migrate dev` si prefieres migraciones versionadas en `prisma/migrations/`.

---

## Variables de entorno (requeridas)

| Variable | Descripción | Dónde obtenerla |
|---|---|---|
| `DATABASE_URL` | Cadena **pooled** de Postgres | Neon → Dashboard → Connection string |
| `DIRECT_URL` | Cadena **directa** de Postgres | Neon → Dashboard → Connection string |
| `AUTH_SECRET` | Clave para firmar la cookie de sesión (JWT) | Genera con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `STRIPE_SECRET_KEY` | Cobros y reembolsos de la taquilla | Stripe → Developers → API keys (`sk_test_…`/`sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Firma de `/api/stripe/webhook` | Stripe → Developers → Webhooks → endpoint `https://TU-DOMINIO/api/stripe/webhook` (`whsec_…`) |
| `STRIPE_CURRENCY` | Moneda de la taquilla | `cop` (por defecto) |
| `NEXT_PUBLIC_SITE_URL` | URL pública para `success_url`/`cancel_url` | `https://tu-dominio.vercel.app` |

> La taquilla paga necesita el webhook. Suscríbelo a `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired` y `charge.refunded`.

---

## Opción A: Vercel (recomendada)

1. Subir el repo a GitHub
2. Ir a [vercel.com/new](https://vercel.com/new)
3. Importar el repositorio
4. Vercel detecta Next.js automáticamente — no necesita configuración
5. Agregar las 3 variables de entorno en **Settings → Environment Variables**
6. Deploy

**Pros:** zero-config, analytics, previews por PR.

> El `build` incluye `prisma generate` automáticamente (`npm run build`).

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
  -e DATABASE_URL="postgresql://...-pooler.../agendamayor?sslmode=require" \
  -e DIRECT_URL="postgresql://.../agendamayor?sslmode=require" \
  -e AUTH_SECRET="..." \
  agenda-mayor
```

---

## Post-deploy

1. Verificar: `GET /api/salud` debe retornar `{"data":{"ok":true,...}}`
2. Para tener un ADMIN: registrarse en `/registro` y cambiar el rol en la BD
   (`update usuario set rol = (select id_rol from rol where nombre = 'ADMIN') where correo = '...'`),
   o usar los usuarios del seed.
3. Importar eventos: `POST /api/admin/importar-eventos` (como ADMIN).
