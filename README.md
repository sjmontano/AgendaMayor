<div align="center">

# Agenda Mayor

### Vitrina de Proyectos y Eventos — Institución Universitaria Colegio Mayor del Cauca

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-3-729B1B?logo=vitest)

**SNIES 3104 · NIT 891.500.759-1**

</div>

---

## Contexto del Proyecto

**Agenda Mayor** es la plataforma web de divulgación académica de la Institución Universitaria Colegio Mayor del Cauca (Unimayor). Funciona como vitrina permanente de trabajos de aula, semilleros y opciones de grado, junto con una cartelera de eventos académicos y perfiles públicos de estudiantes y docentes.

El sistema está diseñado para que cualquier estudiante con correo institucional pueda publicar su proyecto, recibir el aval de un docente, y verlo destacado en la vitrina — sin costos, sin inscripciones, completamente informativo y gratuito.

### Alcance funcional

| Módulo | Descripción |
|---|---|
| **Vitrina de Proyectos** | Catálogo público con filtros por facultad, tipo y estado. Cards con hover shadow, detalle con puesto asignado. |
| **Cartelera de Eventos** | Eventos de la BD (OFICIAL, EAFI, COMUNIDAD) + eventos en vivo del feed RSS de unimayor.edu.co. |
| **Perfiles Públicos** | Username, bio, facultad, programa, proyectos publicados y eventos creados. |
| **Publicación** | Formulario con validación Zod,	State Machine (BORRADOR → EN_REVISION → PUBLICADO/RECHAZADO). |
| **Aval Docente** | Docente revisa y aprueba/rechaza proyectos de su facultad. Notificaciones en tiempo real. |
| **Administración** | Moderación de proyectos, importación de eventos RSS, gestión de puestos EAFI. |
| **Autenticación** | Sesión propia (email/contraseña con bcrypt + cookie JWT httpOnly), registro con correo @unimayor.edu.co. |

---

## Arquitectura General

El sistema sigue el patrón **MVC por capas** (Model-View-Controller) con regla de dependencia estricta:

```
Presentación → Modelo → Datos → Infraestructura
   (Vistas)    (Servicios) (Repositorios)  (Prisma/Postgres, RSS)
```

**Nunca se invierte la dependencia.** Las vistas solo consultan la API propia (`/api/*`), nunca la base de datos directamente.

### Diagrama de capas

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTACIÓN                          │
│  app/ (pages + API routes)  ·  components/ (UI)         │
│  Regla: solo consume /api/*, nunca modelo/ ni la BD      │
├─────────────────────────────────────────────────────────┤
│                     MODELO                               │
│  modelo/ (services + repositories + DTOs + states)       │
│  Regla: negocio puro, sin dependencias de framework      │
├─────────────────────────────────────────────────────────┤
│                       DATOS                              │
│  lib/db.ts (Prisma), lib/sesion.ts, lib/password.ts      │
│  Regla: acceso a Postgres, cookies, credenciales         │
├─────────────────────────────────────────────────────────┤
│                  INFRAESTRUCTURA                         │
│  lib/integraciones/ (RSS UNIMAYOR)                       │
│  lib/errors.ts, lib/api.ts, lib/auth.ts                  │
│  Regla: servicios externos, utilidades compartidas       │
└─────────────────────────────────────────────────────────┘
```

---

## Estructura de Carpetas

```
agenda-mayor/
├── src/
│   ├── app/                          # Next.js App Router (Vistas + Controllers)
│   │   ├── layout.tsx                # Layout raíz: Navbar + Franja + Footer
│   │   ├── page.tsx                  # Landing principal
│   │   ├── globals.css               # Tailwind v4 + tokens UNIMAYOR
│   │   ├── icon.jpg                  # Favicon (isologo)
│   │   │
│   │   ├── api/                      # Controllers (endpoints REST)
│   │   │   ├── salud/                # GET /api/salud — health check
│   │   │   ├── perfil/               # GET/PATCH /api/perfil
│   │   │   ├── perfiles/[username]/  # GET /api/perfiles/:username
│   │   │   ├── proyectos/            # GET/POST /api/proyectos
│   │   │   ├── proyectos/[id]/       # GET/PATCH /api/proyectos/:id
│   │   │   ├── eventos/              # GET/POST /api/eventos
│   │   │   ├── eventos/rss/          # GET /api/eventos/rss (EN VIVO)
│   │   │   ├── puestos/              # GET/POST /api/puestos
│   │   │   ├── puestos/[id]/         # GET/PATCH/DELETE /api/puestos/:id
│   │   │   ├── notificaciones/       # GET/PATCH /api/notificaciones
│   │   │   ├── avisos/               # GET /api/avisos
│   │   │   ├── usuarios/registro/    # POST /api/usuarios/registro (crea cuenta + sesión)
│   │   │   ├── auth/
│   │   │   │   ├── login/            # POST /api/auth/login
│   │   │   │   └── logout/           # POST /api/auth/logout
│   │   │   └── admin/
│   │   │       ├── proyectos/        # GET/PATCH /api/admin/proyectos
│   │   │       └── importar-eventos/ # POST /api/admin/importar-eventos
│   │   │
│   │   ├── proyectos/                # Pages de vitrina
│   │   │   ├── page.tsx              # /proyectos — catálogo con filtros
│   │   │   ├── [id]/page.tsx         # /proyectos/:id — detalle
│   │   │   └── nuevo/page.tsx        # /proyectos/nuevo — publicar
│   │   ├── eventos/page.tsx          # /eventos — cartelera DB + RSS
│   │   ├── perfil/[username]/page.tsx # /perfil/:username
│   │   ├── registro/page.tsx         # /registro
│   │   ├── ingresar/page.tsx         # /ingresar
│   │   └── admin/page.tsx            # /admin — panel administrativo
│   │
│   ├── components/                   # UI reutilizable (Vistas)
│   │   ├── layout/                   # navbar, footer, franja
│   │   ├── ui/                       # botones, skeleton
│   │   ├── vitrina/                  # proyecto-card, filtros
│   │   ├── eventos/                  # evento-card, evento-rss-card
│   │   ├── perfil/                   # perfil-card
│   │   ├── auth/                     # registro-form, ingreso-form
│   │   ├── admin/                    # moderacion, puestos
│   │   ├── notificaciones/           # campana
│   │   └── proyectos/                # publicar-form
│   │
│   ├── modelo/                       # Lógica de negocio (Model)
│   │   ├── usuarios/                 # dto, repository, service
│   │   ├── proyectos/                # dto, repository, service, state
│   │   ├── eventos/                  # dto, repository, service
│   │   ├── puestos/                  # dto, repository, service
│   │   ├── avisos/                   # dto, repository, service
│   │   └── notificaciones/           # dto, repository, service
│   │
│   ├── lib/                          # Infraestructura compartida
│   │   ├── db.ts                     # Singleton PrismaClient
│   │   ├── sesion.ts                 # Sesión JWT en cookie (login/logout)
│   │   ├── password.ts               # Hash/verify bcrypt
│   │   ├── integraciones/            # unimayor-rss.ts (parser + fetcher)
│   │   ├── api.ts                    # apiGet/Post/Patch + headersConSesion
│   │   ├── auth.ts                   # obtenerUsuarioPorAuthId, requiereRol, puedeAvalar
│   │   ├── errors.ts                 # ApiError + ok/err envelope
│   │   ├── design-tokens.ts          # tokens UNIMAYOR (colores, motion, badge)
│   │   └── facultades.ts             # lista de facultades
│   │
│   └── proxy.ts                      # Proxy middleware (Next 16)
│
├── tests/                            # Pruebas unitarias (Vitest)
│   ├── api.test.ts                   # Tests de envelope API
│   ├── arquitectura.test.ts          # Test de arquitectura (layer violations)
│   ├── proyecto.dto.test.ts          # Tests de validación Zod
│   ├── proyecto.state.test.ts        # Tests de State Machine
│   └── unimayor-rss.test.ts          # Tests del parser RSS
│
├── prisma/
│   ├── schema.prisma                 # Modelo de datos (7 tablas + contrasena_hash)
│   └── seed.mjs                       # Roles + usuarios demo
│
├── public/brand/                     # Activos de marca
│   ├── logoPrincipal.jpg             # Isologo (navbar, hero, favicon)
│   ├── logo_blanco.png               # Logo blanco (footer)
│   ├── escudo-unimayor.png           # Escudo (reserva)
│   └── favicon-unimayor.png          # Favicon alternativo
│
├── references/                       # Documentación académica
│   ├── ISO-25010.md                  # Modelo de calidad del software
│   ├── ISO-29119.md                  # Estándares de pruebas
│   ├── ISO-42010.md                  # Ingeniería de requisitos
│   ├── BPMN-2.0.md                   # Modelado de procesos
│   ├── ISTQB.md                      # Certificación de testing
│   ├── Patrones-Diseno.md            # Catálogo de patrones
│   └── 00-INDICE.md                  # Índice general
│
├── AGENTS.md                         # Guía de instrucciones para el asistente
├── DESIGN.md                         # Sistema de diseño y documentación técnica
├── DEPLOY.md                         # Guía de despliegue (Vercel, Render, Docker)
├── vercel.json                       # Configuración Vercel
├── Dockerfile                        # Contenedor de producción
├── render.yaml                       # Configuración Render Blueprint
├── .env.example                      # Template de variables de entorno
└── package.json
```

---

## Equipo Docente y Estudiantil

| Rol | Nombre | Código |
|---|---|---|
| **Docente** | Mag. María Isabel Bastidas | — |
| **Estudiante 1** | Santiago Montaño | 90225040 |
| **Estudiante 2** | Luisa Maya | 90225029 |
| **Estudiante 3** | Camilo Sotelo | 90225030 |

> Cada estudiante desarrolló 5 Historias de Usuario = **15 HUs totales**.

---

## Stack Tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| **Next.js** | 16.3.5 | Framework full-stack (App Router, Server Components, API Routes) |
| **React** | 19.2.8 | UI library con Server Components y Suspense |
| **TypeScript** | 5.x | Tipado estático estricto |
| **Tailwind CSS** | 4.x | Utility-first CSS con theme tokens UNIMAYOR |
| **Nunito Sans** | — | Tipografía institucional (via next/font) |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| **PostgreSQL (Neon)** | — | Base de datos relacional gestionada |
| **Prisma** | 6.x | ORM: esquema, cliente tipado y migraciones |
| **bcryptjs** | 3.x | Hash de contraseñas |
| **jose** | 6.x | Firma/verificación del JWT de sesión |
| **Zod** | 4.x | Validación de DTOs en tiempo de ejecución |
| **fast-xml-parser** | 5.x | Parser del feed RSS de UNIMAYOR |

### Testing
| Tecnología | Versión | Uso |
|---|---|---|
| **Vitest** | 3.2.7 | Pruebas unitarias con assertions nativas |

### Despliegue
| Plataforma | Configuración |
|---|---|
| **Vercel** (recomendada) | `vercel.json` — zero-config para Next.js |
| **Render** | `render.yaml` + `Dockerfile` |
| **Docker** | `Dockerfile` multi-stage con standalone output |

---

## Patrones de Diseño Implementados

### Patrones Estructurales (GoF)

| Patrón | Ubicación | Descripción |
|---|---|---|
| **Adapter** | `lib/sesion.ts` + `lib/password.ts` | Aíslan la estrategia de sesión (JWT/cookie) y de hash del resto del código. Permiten cambiar de mecanismo sin tocar los servicios. |
| **DTO** | `modelo/*/dto.ts` | Transfiere datos entre capas sin exponer entidades de BD. Validación Zod en cada DTO. |
| **Repository** | `modelo/*/repository.ts` | Abstrae el acceso a datos. Los servicios nunca llaman a Prisma directamente — solo el repository. |

### Patrones Creacionales (GoF)

| Patrón | Ubicación | Descripción |
|---|---|---|
| **Singleton** | `lib/db.ts` | Instancia única de `PrismaClient` (evita múltiples conexiones con el hot-reload). |
| **Factory** | `lib/errors.ts` | Funciones `ok()`, `err()`, `badRequest()`, `forbidden()` que crean respuestas estandarizadas. |

### Patrones de Comportamiento (GoF)

| Patrón | Ubicación | Descripción |
|---|---|---|
| **State** | `modelo/proyectos/proyecto.state.ts` | Máquina de estados: BORRADOR → EN_REVISION → PUBLICADO/RECHAZADO. Cada estado define transiciones válidas. |
| **Strategy** | `modelo/eventos/evento.service.ts` | Reglas de creación según rol (ADMIN → OFICIAL, DOCENTE → EAFI, ESTUDIANTE → COMUNIDAD). |

### Patrón Arquitectónico

| Patrón | Ubicación | Descripción |
|---|---|---|
| **MVC por capas** | Todo el proyecto | Separación estricta Presentación → Modelo → Datos → Infraestructura. Verificado por test automático. |

---

## Modelo de Datos

7 tablas en PostgreSQL (Neon), definidas en `prisma/schema.prisma`:

```
ROL (1) ──── (N) USUARIO (1) ──── (N) PROYECTO
                       │                    │
                       │                    ├── (N) PUESTO
                       │                    │
                       └── (N) EVENTO ──────┘
                              │
                              └── (N) PUESTO

USUARIO (1) ──── (N) AVISO
USUARIO (1) ──── (N) NOTIFICACION
```

| Tabla | Registros | Descripción |
|---|---|---|
| `rol` | 3 | ESTUDIANTE, DOCENTE, ADMIN |
| `usuario` | — | Perfil completo con `contrasena_hash` (bcrypt), username, facultad, semillero |
| `proyecto` | — | Título, descripción, fotos (JSONB), tipo, estado, aval docente |
| `evento` | — | Tipo (OFICIAL/EAFI/COMUNIDAD), fechas, lugar, imagen |
| `puesto` | — | Ubicación física (edificio, piso, salón) para mesas EAFI |
| `aviso` | — | Avisos institucionales |
| `notificacion` | — | Notificaciones por usuario (campana) |

---

## Estándares Académicos

| Estándar | Aplicación |
|---|---|
| **ISO/IEC 25010** | Requerimientos no funcionales: portabilidad, fiabilidad, eficiencia, usabilidad, seguridad, compatibilidad |
| **ISO/IEC/IEEE 29119** | Criterios de aceptación evaluables, trazabilidad HU → BPMN → código |
| **ISO/IEC/IEEE 42010** | Documento SAD: contexto, vistas, modelo de datos, despliegue |
| **ISTQB** | Casos de prueba derivados de criterios de aceptación, pruebas automatizadas |

---

## Historias de Usuario

15 HUs documentadas en LaTeX (`entregable/latex/Historias_Usuario_UNIMAYOR.tex`):

| # | HU | Estudiante |
|---|---|---|
| HU-01 | Registrar cuenta con correo institucional | Santiago Montaño |
| HU-02 | Iniciar sesión (email/contraseña propia) | Santiago Montaño |
| HU-03 | Cerrar sesión invalidando la cookie | Santiago Montaño |
| HU-04 | Ver vitrina de proyectos con filtros | Santiago Montaño |
| HU-05 | Ver detalle de proyecto con puesto | Santiago Montaño |
| HU-06 | Publicar proyecto en borrador | Luisa Maya |
| HU-07 | Editar proyecto en borrador | Luisa Maya |
| HU-08 | Eliminar proyecto propio | Luisa Maya |
| HU-09 | Ver cartelera de eventos | Luisa Maya |
| HU-10 | Crear evento COMUNIDAD | Luisa Maya |
| HU-11 | Crear evento EAFI (docente) | Camilo Sotelo |
| HU-12 | Avalar proyecto de facultad | Camilo Sotelo |
| HU-13 | Importar eventos del portal UNIMAYOR | Camilo Sotelo |
| HU-14 | Ver perfil público de usuario | Camilo Sotelo |
| HU-15 | Recibir notificaciones de estado | Camilo Sotelo |

---

## Instalación y Desarrollo

```bash
# 1. Clonar
git clone https://github.com/TU_USUARIO/agenda-mayor.git
cd agenda-mayor

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con la cadena de conexión de Neon (DATABASE_URL + DIRECT_URL)
# y definir AUTH_SECRET.

# 4. Crear el esquema y sembrar roles/usuarios
npx prisma db push
npx prisma db seed     # usuarios demo, contraseña: Unimayor2026

# 5. Desarrollo
npm run dev
# Abrir http://localhost:3000
```

### Comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (localhost:3000) |
| `npm run build` | Build de producción (`prisma generate` + standalone) |
| `npm start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run db:push` | Crea/actualiza el esquema en Postgres |
| `npm run db:migrate` | Migraciones versionadas (`prisma migrate dev`) |
| `npm run db:seed` | Roles + usuarios demo |
| `npm run db:studio` | Prisma Studio |
| `npx vitest run` | Ejecutar pruebas |
| `npx tsc --noEmit` | Verificación de tipos |

---

## Variables de Entorno

| Variable | Descripción | Obligatoria |
|---|---|---|
| `DATABASE_URL` | Cadena pooled de Postgres (Neon) | Sí |
| `DIRECT_URL` | Cadena directa de Postgres (migraciones) | Sí |
| `AUTH_SECRET` | Clave para firmar la cookie de sesión | Sí |

---

## Despliegue

Ver [DEPLOY.md](DEPLOY.md) para guía completa.

**Vercel (recomendada):**
```bash
npx vercel --prod
```

**Docker:**
```bash
docker build -t agenda-mayor .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://...-pooler.../agendamayor?sslmode=require" \
  -e DIRECT_URL="postgresql://.../agendamayor?sslmode=require" \
  -e AUTH_SECRET="..." \
  agenda-mayor
```

---

## Licencia

Proyecto académico — Institución Universitaria Colegio Mayor del Cauca.
No apto para producción comercial sin autorización.

---

<div align="center">

**Institución Universitaria Colegio Mayor del Cauca**
SNIES 3104 · NIT 891.500.759-1
Claustro Encarnación Cra. 5 # 5 - 40, Popayán
Conmutador: (602) 8274178 · Línea gratuita: 01-8000-931018

</div>
