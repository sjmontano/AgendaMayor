<div align="center">

# Agenda Mayor

### Vitrina de Proyectos y Eventos — Institución Universitaria Colegio Mayor del Cauca

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)
![Vitest](https://img.shields.io/badge/Vitest-3-729B1B?logo=vitest)

**Proyecto integrador · Arquitectura de Software**

**Aplicación en línea: https://agenda-mayor.vercel.app**

</div>

---

## Tabla de contenido

1. [Contexto del proyecto](#1-contexto-del-proyecto)
2. [Equipo](#2-equipo)
3. [Cómo probar la aplicación (usuarios de prueba)](#3-cómo-probar-la-aplicación)
4. [Guía de revisión paso a paso](#4-guía-de-revisión-paso-a-paso)
5. [Tecnologías](#5-tecnologías)
6. [Arquitectura: MVC por capas](#6-arquitectura-mvc-por-capas)
7. [Patrones de diseño implementados](#7-patrones-de-diseño-implementados)
8. [Flujo de compra con Bold](#8-flujo-de-compra-con-bold)
9. [Roles y permisos](#9-roles-y-permisos)
10. [Modelo de datos](#10-modelo-de-datos)
11. [API REST](#11-api-rest)
12. [Historias de usuario y trazabilidad](#12-historias-de-usuario-y-trazabilidad)
13. [Pruebas automáticas](#13-pruebas-automáticas)
14. [Decisiones de diseño](#14-decisiones-de-diseño)
15. [Instalación local](#15-instalación-local)
16. [Despliegue](#16-despliegue)

---

## 1. Contexto del proyecto

**Agenda Mayor** es la plataforma web de divulgación académica de la Institución Universitaria Colegio Mayor del Cauca. Reúne en un solo lugar:

- una **vitrina** de los proyectos de los estudiantes, que un docente revisa antes de publicarlos;
- una **cartelera** de eventos institucionales (oficiales, ferias EAFI y eventos de la comunidad);
- una **taquilla** para comprar entradas a los eventos que lo requieran, con pago en línea por **Bold**.

| Módulo | Qué hace |
|---|---|
| **Usuarios y seguridad** | Registro con correo `@unimayor.edu.co`, inicio de sesión (contraseña cifrada con bcrypt + cookie JWT) y control de acceso por roles: ESTUDIANTE, DOCENTE y ADMIN. |
| **Vitrina de proyectos** (catálogo) | Catálogo público con filtros por facultad, tipo y texto. Detalle con el puesto asignado en la feria EAFI. |
| **Publicación y aval** | El estudiante publica; el docente de su facultad aprueba o rechaza con motivo (máquina de estados). |
| **Cartelera de eventos** | Eventos OFICIAL, EAFI y COMUNIDAD (cada rol crea los suyos) y publicaciones del portal UNIMAYOR por RSS. |
| **Carrito y pedido (checkout)** | El usuario elige cuántas entradas quiere de cada tipo; se crea una orden con el total calculado en el servidor. |
| **Pasarela de pagos** | La orden se paga en Bold (tarjeta, PSE, Nequi, Botón Bancolombia). Al confirmarse el pago se generan las entradas con un código único. |
| **Notificaciones** | El usuario recibe avisos cuando cambia el estado de su proyecto o se confirma una compra. |
| **Administración** | Cola de revisión, puestos de la feria EAFI, importación de eventos del portal y validación de entradas en la puerta. |

---

## 2. Equipo

| Rol | Nombre | Código |
|---|---|---|
| **Docente** | Mag. María Isabel Bastidas | — |
| **Estudiante** | Santiago Montaño | 90225040 |
| **Estudiante** | Luisa Maya | 90225029 |
| **Estudiante** | Camilo Sotelo | 90225030 |

---

## 3. Cómo probar la aplicación

Entrar a **https://agenda-mayor.vercel.app** → **Ingresar**.

Todas las cuentas de prueba usan la misma contraseña: **`Unimayor2026`**

| Rol | Correo | Usuario | Facultad | Qué puede revisar |
|---|---|---|---|---|
| **ADMIN** | `admin@unimayor.edu.co` | admin.mayor | — | Todo: moderación de todas las facultades, puestos EAFI, importar eventos, validar entradas, crear eventos OFICIAL |
| **DOCENTE** | `mibastidas@unimayor.edu.co` | prof.bastidas | Ingeniería | Aprobar/rechazar proyectos de Ingeniería, crear eventos EAFI, validar entradas |
| **DOCENTE** | `docente@unimayor.edu.co` | profe.ingenieria | Ingeniería | Igual al anterior |
| **DOCENTE** | `jiruiz@unimayor.edu.co` | prof.ruiz | Ingeniería | Igual al anterior |
| **DOCENTE** | `cpordonez@unimayor.edu.co` | prof.ordonez | Educación | Solo revisa proyectos de Educación |
| **ESTUDIANTE** | `smontano@unimayor.edu.co` | santiago.m | Ingeniería | Publicar proyectos, comprar entradas, notificaciones |
| **ESTUDIANTE** | `lmmaya@unimayor.edu.co` | luisa.m | Arte y Diseño | Igual al anterior |
| **ESTUDIANTE** | `pamunoz@unimayor.edu.co` | paula.munoz | Ingeniería | Igual al anterior |
| **ESTUDIANTE** | `mffernandez@unimayor.edu.co` | mafe.fernandez | Ingeniería | Igual al anterior |

También se puede crear una cuenta nueva en **Crear cuenta** con cualquier correo que termine en `@unimayor.edu.co` (queda con rol ESTUDIANTE).

### Pagos de prueba

Bold está configurado en **modo de pruebas**: no se cobra dinero real. En la página de pago de Bold aparece el aviso *"Modo de pruebas"* y el enlace **"Ver datos de prueba"**, que muestra las tarjetas y datos ficticios para aprobar o rechazar un pago.

Eventos que venden entradas: **"Concierto Rock en el Claustro (prueba pagos)"** y **"Taller de IA aplicada: crea tu primer agente con Python"** (en la cartelera llevan la etiqueta *Entradas*).

---

## 4. Guía de revisión paso a paso

**A. Como visitante (sin iniciar sesión)**
1. Inicio: proyectos destacados, próximos eventos y avisos.
2. **Proyectos**: filtrar por facultad, tipo o texto → abrir un proyecto → ver ficha y puesto EAFI.
3. **Eventos**: cartelera propia + publicaciones del portal UNIMAYOR.

**B. Como estudiante** (`smontano@unimayor.edu.co`)
1. **Mi panel** → *+ Publicar proyecto* → llenar el formulario → queda **En revisión** (llega una notificación).
2. Abrir **Eventos** → *Concierto Rock en el Claustro* → elegir cantidad → **Pagar con Bold**.
3. En Bold usar los datos de prueba → al volver, la página de resultado muestra **Pago aprobado**.
4. **Mis entradas**: aparece la entrada con su código `ENT-…`.
5. **Notificaciones**: aviso de la compra confirmada.
6. Su perfil (`@santiago.m`) → *Editar mi perfil* (HU-03).

**C. Como docente** (`mibastidas@unimayor.edu.co`)
1. **Mi panel** → *Cola de revisión*: solo aparecen proyectos de Ingeniería.
2. **Publicar** un proyecto o **Rechazar** indicando el motivo → el estudiante recibe la notificación.
3. *Validar entrada*: escribir el código `ENT-…` de una entrada comprada → la primera vez es válida; la segunda dice *"Esta entrada ya fue usada"*.
4. **Eventos** → *+ Crear evento*: puede crear EAFI (de su facultad) y COMUNIDAD, no OFICIAL.

**D. Como administrador** (`admin@unimayor.edu.co`)
1. **Mi panel**: cola de revisión de **todas** las facultades.
2. *Puestos feria EAFI*: crear un puesto, asignarlo a un proyecto, liberarlo o eliminarlo.
3. *Importar eventos del portal*: trae los eventos del RSS de unimayor.edu.co (no duplica títulos).
4. Crear un evento OFICIAL con venta de entradas.

---

## 5. Tecnologías

| Capa | Tecnología | Para qué |
|---|---|---|
| Presentación | Next.js 16 (App Router), React 19 | Páginas y controladores de la API |
| Presentación | CSS propio (`src/app/globals.css`) | Estilos con los colores institucionales, sin frameworks |
| Modelo | TypeScript 5, Zod 4 | Lógica de negocio y validación de datos (DTO) |
| Datos | PostgreSQL en Neon, Prisma 6 | Base de datos y acceso a ella |
| Infraestructura | jose (JWT), bcryptjs | Sesión y cifrado de contraseñas |
| Infraestructura | API de links de pago de **Bold** | Pasarela de pagos |
| Infraestructura | fast-xml-parser | Leer el RSS del portal UNIMAYOR |
| Pruebas | Vitest 3 | Pruebas automáticas |
| Despliegue | Vercel | Hosting |

---

## 6. Arquitectura: MVC por capas

```
┌────────────────────────────────────────────────────────────────────────┐
│ PRESENTACIÓN (Vista + Controlador)                                     │
│   src/components/**        Vistas: tarjetas, formularios, tablas       │
│   src/app/**/page.tsx      Páginas: piden datos al modelo y arman      │
│                            la vista                                    │
│   src/app/api/**/route.ts  Controladores REST:                         │
│                            sesión → rol → DTO → service → respuesta    │
└───────────────────────────────┬────────────────────────────────────────┘
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│ MODELO (src/modelo/<módulo>/)                                          │
│   *.dto.ts      qué datos entran (validación Zod)                      │
│   *.service.ts  reglas de negocio                                      │
│   *.state.ts    máquina de estados (proyectos)                         │
└───────────────────────────────┬────────────────────────────────────────┘
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│ DATOS                                                                  │
│   *.repository.ts  únicas clases que consultan la base de datos        │
│   src/lib/db.ts    conexión Prisma (Singleton)                         │
└───────────────────────────────┬────────────────────────────────────────┘
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│ INFRAESTRUCTURA (src/lib/)                                             │
│   sesion.ts · password.ts · auth.ts · errors.ts                        │
│   integraciones/bold.ts · integraciones/unimayor-rss.ts                │
└────────────────────────────────────────────────────────────────────────┘
```

**Reglas de capas** (verificadas por `tests/arquitectura.test.ts`):
- `components/` nunca importa `@/modelo`: la vista no conoce el modelo.
- Solo los `*.repository.ts` importan la conexión a la base de datos (`@/lib/db`).

**Ejemplo de una petición completa** — publicar un proyecto:

```
publicar-form.tsx (Vista)
  └─ POST /api/proyectos → route.ts (Controlador)
       ├─ usuarioActual()                    lib/auth.ts      (¿quién es?)
       ├─ ProyectoCreateSchema.parse(body)   proyecto.dto.ts  (¿datos válidos?)
       └─ proyecto.service.crear()           (regla: EAFI exige evento origen)
            ├─ proyecto.repository.crear()   (INSERT en la BD, estado EN_REVISION)
            └─ notificacion.repository.crear()  (aviso al autor)
  └─ ok(proyecto, 201)  →  { data, error: null }   lib/errors.ts (Factory)
```

### Estructura de carpetas

```
agenda-mayor/
├── prisma/
│   ├── schema.prisma            Modelo de datos
│   └── seed.mjs                 Datos de prueba (roles y usuarios)
├── public/brand/                Logos institucionales
├── src/
│   ├── app/                     PRESENTACIÓN
│   │   ├── page.tsx             Inicio
│   │   ├── layout.tsx           Estructura común (menú y pie)
│   │   ├── globals.css          Hoja de estilos única
│   │   ├── proyectos/           Vitrina, [id] detalle, nuevo
│   │   ├── eventos/             Cartelera, [id] detalle + compra, nuevo
│   │   ├── checkout/resultado/  Regreso desde Bold
│   │   ├── mis-entradas/        Entradas compradas
│   │   ├── panel/               Panel según el rol
│   │   ├── perfil/[username]/   Perfil público
│   │   ├── notificaciones/
│   │   ├── ingresar/ · registro/
│   │   └── api/                 Controladores REST
│   ├── components/              Vistas reutilizables
│   │   ├── auth/ eventos/ layout/ notificaciones/
│   │   ├── panel/ perfil/ proyectos/ ui/
│   ├── modelo/                  MODELO + DATOS (un módulo por carpeta)
│   │   ├── usuarios/            dto · service · repository
│   │   ├── proyectos/           dto · service · repository · state
│   │   ├── eventos/             dto · service · repository
│   │   ├── puestos/             dto · service · repository
│   │   ├── taquilla/            dto · service · repository
│   │   ├── notificaciones/      repository
│   │   └── avisos/              repository
│   └── lib/                     INFRAESTRUCTURA
│       ├── db.ts  sesion.ts  password.ts  auth.ts  errors.ts
│       ├── api.ts  formato.ts  facultades.ts
│       └── integraciones/       bold.ts · unimayor-rss.ts
└── tests/                       Pruebas automáticas
```

---

## 7. Patrones de diseño implementados

### Patrones estructurales (GoF)

| Patrón | Ubicación | Descripción |
|---|---|---|
| **Adapter** | `lib/sesion.ts` + `lib/password.ts` + `lib/integraciones/bold.ts` | Aíslan la estrategia de sesión (JWT en cookie), el cifrado de contraseñas (bcrypt) y la pasarela de pagos (Bold) del resto del código. Los services llaman a funciones propias (`crearSesion`, `hashPassword`, `crearLinkDePago`) sin conocer la librería o API que hay detrás; cambiar el mecanismo no obliga a tocar los services. |
| **DTO** | `modelo/*/*.dto.ts` | Definen qué datos entran a cada operación y los validan con Zod antes de llegar al service (`ProyectoCreateSchema`, `EventoCreateSchema`, `CompraSchema`, `RegistroSchema`…). Las respuestas no exponen campos sensibles: `contrasena_hash` nunca sale de la API. |
| **Repository** | `modelo/*/*.repository.ts` | Abstraen el acceso a datos. Los services nunca llaman a Prisma directamente, solo al repository (verificado por test). |

### Patrones creacionales (GoF)

| Patrón | Ubicación | Descripción |
|---|---|---|
| **Singleton** | `lib/db.ts` | Una sola instancia de `PrismaClient` guardada en `globalThis`, para no abrir conexiones nuevas con cada recarga en desarrollo. |
| **Factory** | `lib/errors.ts` | Funciones `ok()`, `err()`, `badRequest()`, `unauthorized()`, `forbidden()`, `notFound()`, `conflict()` que fabrican respuestas y errores con el mismo formato `{ data, error }` en toda la API. |

### Patrones de comportamiento (GoF)

| Patrón | Ubicación | Descripción |
|---|---|---|
| **State** | `modelo/proyectos/proyecto.state.ts` | Máquina de estados del proyecto. Cada estado define a qué estados puede pasar y qué rol puede hacerlo: `BORRADOR → EN_REVISION`, `EN_REVISION → PUBLICADO / RECHAZADO` (docente/admin), `RECHAZADO → EN_REVISION` (estudiante), y paso a `ELIMINADO`. Una transición no permitida responde 403. |
| **Strategy** | `modelo/eventos/evento.service.ts` | El objeto `REGLAS_POR_TIPO` guarda una regla de creación por tipo de evento: ADMIN → OFICIAL, DOCENTE → EAFI de su facultad, cualquiera → COMUNIDAD. El service elige la regla según el tipo y la ejecuta, sin cadenas de `if`. Agregar un tipo nuevo = agregar una regla. |

```ts
// evento.service.ts (resumen)
const REGLAS_POR_TIPO: Record<TipoEvento, ReglaDeCreacion> = {
  OFICIAL:   (datos, usuario) => { if (usuario.nombre_rol !== "ADMIN") throw forbidden(...) },
  EAFI:      (datos, usuario) => { /* docente de su facultad, exige edición */ },
  COMUNIDAD: () => { /* cualquier usuario */ },
};

const regla = REGLAS_POR_TIPO[datos.tipo];
regla(datos, usuario);
```

### Patrón arquitectónico

| Patrón | Ubicación | Descripción |
|---|---|---|
| **MVC por capas** | Todo el proyecto | Separación estricta Presentación → Modelo → Datos → Infraestructura. Verificado por test automático. |

---

## 8. Flujo de compra con Bold

```
 Usuario            Agenda Mayor                                   Bold
    │  elige entradas   │                                             │
    │──────────────────▶│ POST /api/checkout                          │
    │                   │  1. valida el carrito (CompraSchema)        │
    │                   │  2. lee precios y cupos de la BD            │
    │                   │  3. crea Orden PENDIENTE                    │
    │                   │  4. crearLinkDePago() ─────────────────────▶│
    │◀──────────────────│◀──────────────── url del link de pago ──────│
    │  paga en checkout.bold.co ─────────────────────────────────────▶│
    │                   │◀──── webhook /api/pagos/bold/webhook ───────│
    │◀── vuelve a /checkout/resultado?orden=ORD-…                     │
    │                   │  5. conciliar(): consultarPago() ──────────▶│
    │                   │     PAGADA  → genera entradas + notificación│
    │                   │     RECHAZADA / EXPIRADA → cierra la orden  │
    │  Mis entradas     │                                             │
```

- **El precio nunca viene del navegador**: el service lo lee de la base de datos.
- **Estados de la orden**: `PENDIENTE → PAGADA | RECHAZADA | EXPIRADA` (30 minutos para pagar).
- **Doble aviso**: el webhook y la página de resultado pueden llegar a la vez; la orden solo pasa a PAGADA una vez (actualización condicionada a `estado = PENDIENTE` dentro de una transacción).
- **Webhook seguro**: se verifica la firma `x-bold-signature` y se ignoran avisos repetidos (`pago_evento`).
- **Eventos gratuitos**: si el total es $0, la orden se confirma sin pasar por Bold.
- **Validación en la puerta**: la entrada pasa de `VALIDA` a `USADA` una sola vez.

---

## 9. Roles y permisos

| Acción | Visitante | Estudiante | Docente | Admin |
|---|:---:|:---:|:---:|:---:|
| Ver vitrina, eventos y perfiles | ✓ | ✓ | ✓ | ✓ |
| Registrarse / iniciar sesión | ✓ | — | — | — |
| Publicar y editar proyecto propio | | ✓ | ✓ | ✓ |
| Reenviar proyecto rechazado | | ✓ (autor) | | |
| Aprobar / rechazar proyectos | | | ✓ (su facultad) | ✓ (todas) |
| Destacar proyectos | | | ✓ | ✓ |
| Crear evento COMUNIDAD | | ✓ | ✓ | ✓ |
| Crear evento EAFI | | | ✓ (su facultad) | ✓ |
| Crear evento OFICIAL | | | | ✓ |
| Comprar entradas | | ✓ | ✓ | ✓ |
| Validar entradas en la puerta | | | ✓ | ✓ |
| Gestionar puestos EAFI | | | | ✓ |
| Importar eventos del portal | | | | ✓ |

---

## 10. Modelo de datos

Definido en `prisma/schema.prisma` (PostgreSQL en Neon).

```
ROL 1───N USUARIO 1───N PROYECTO N───0..1 EVENTO (evento origen EAFI)
              │            │
              │            └──0..1 PUESTO N───1 EVENTO
              ├───N EVENTO (autor)
              ├───N NOTIFICACION
              └───N ORDEN 1───N ORDEN_ITEM N───1 TIPO_ENTRADA N───1 EVENTO
                       │
                       ├───N ENTRADA
                       └───N PAGO_EVENTO
AVISO (sin relaciones)
```

| Tabla | Descripción |
|---|---|
| `rol` | ESTUDIANTE, DOCENTE, ADMIN |
| `usuario` | Perfil con `contrasena_hash` (bcrypt), facultad, programa, semillero, estado activo |
| `proyecto` | Título, descripción, fotos (JSON), tipo, estado, motivo de rechazo, destacado |
| `evento` | Tipo (OFICIAL/EAFI/COMUNIDAD), fechas, lugar o enlace virtual, si vende entradas |
| `puesto` | Mesa física de la feria EAFI (edificio, piso, salón) asignada a un proyecto |
| `aviso` | Avisos institucionales de la portada |
| `notificacion` | Notificaciones de cada usuario |
| `tipo_entrada` | Entradas que vende un evento (nombre, precio en centavos, cantidad total y vendida) |
| `orden` | Pedido del comprador: código, total, estado, referencia del link de Bold |
| `orden_item` | Líneas del pedido (tipo de entrada × cantidad) |
| `entrada` | Entrada individual con código único y estado VALIDA/USADA |
| `pago_evento` | Avisos recibidos de Bold (evita procesar dos veces el mismo) |

> **Nota técnica:** la base de datos en Neon es compartida con la versión extendida del proyecto (rama `app-completa`), que tiene columnas adicionales. Este esquema es un subconjunto compatible: **no ejecutar `prisma db push` ni `prisma migrate`** desde esta versión, porque eliminaría esas columnas.

---

## 11. API REST

Todas las respuestas tienen la forma `{ "data": …, "error": null }` o `{ "data": null, "error": { "message": "…" } }`.

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/usuarios/registro` | Crear cuenta | Público |
| POST | `/api/auth/login` | Iniciar sesión | Público |
| POST | `/api/auth/logout` | Cerrar sesión | Con sesión |
| GET / PATCH | `/api/perfil` | Ver / completar mi perfil | Con sesión |
| GET | `/api/perfiles/[username]` | Perfil público | Público |
| GET / POST | `/api/proyectos` | Listar publicados / publicar | Público / con sesión |
| GET | `/api/proyectos/mios` | Mis proyectos | Con sesión |
| GET / PATCH | `/api/proyectos/[id]` | Detalle / editar o cambiar estado | Según rol |
| GET | `/api/admin/proyectos` | Cola de revisión | Docente, Admin |
| GET / POST | `/api/eventos` | Cartelera / crear evento | Público / con sesión |
| GET | `/api/eventos/rss` | Eventos del portal UNIMAYOR | Público |
| POST | `/api/admin/importar-eventos` | Importar eventos del RSS | Admin |
| GET / POST | `/api/puestos` | Listar / crear puestos | Público / Admin |
| GET / PATCH / DELETE | `/api/puestos/[id]` | Detalle / asignar o liberar / eliminar | Admin |
| POST | `/api/checkout` | Crear orden y link de pago Bold | Con sesión |
| GET | `/api/ordenes/[codigo]` | Estado de mi orden | Comprador |
| POST | `/api/pagos/bold/webhook` | Aviso de pago de Bold | Bold (firma) |
| GET | `/api/mis-entradas` | Mis entradas | Con sesión |
| POST | `/api/entradas/validar` | Validar entrada en la puerta | Docente, Admin |
| GET / PATCH | `/api/notificaciones` | Listar / marcar leídas | Con sesión |
| GET | `/api/avisos` | Avisos activos | Público |
| GET | `/api/salud` | Estado del servicio | Público |

---

## 12. Historias de usuario y trazabilidad

| HU | Historia | Dónde se implementa |
|---|---|---|
| HU-01 | Registrarse con correo institucional | `registro-form.tsx` → `api/usuarios/registro` → `usuario.service.registrar` (`RegistroSchema` exige `@unimayor.edu.co`) |
| HU-02 | Iniciar sesión | `ingreso-form.tsx` → `api/auth/login` → `usuario.service.iniciarSesion` + `lib/sesion.ts` |
| HU-03 | Completar perfil | `editar-perfil.tsx` → `api/perfil` (PATCH) → `usuario.service.actualizarMiPerfil` |
| HU-04 | Ver perfil público | `perfil/[username]/page.tsx` → `usuario.service.obtenerPerfilPublico` |
| HU-05 | Cerrar sesión | `boton-cerrar-sesion.tsx` → `api/auth/logout` → `lib/sesion.cerrarSesion` |
| HU-06 | Publicar proyecto | `publicar-form.tsx` → `api/proyectos` (POST) → `proyecto.service.crear` |
| HU-07 | Filtrar proyectos | `proyectos/page.tsx` (formulario GET) → `proyecto.repository.listarPublicados` |
| HU-08 | Ver detalle de proyecto | `proyectos/[id]/page.tsx` + `puesto.service.obtenerPorProyecto` |
| HU-09 | Editar / reenviar proyecto rechazado | `acciones-autor.tsx` → `api/proyectos/[id]` → `proyecto.service.editar` / `cambiarEstado` |
| HU-10 | Recibir notificaciones | `notificacion.repository` (lo usan los services de proyectos y taquilla) → `notificaciones/page.tsx` |
| HU-11 | Crear evento según rol | `evento-form.tsx` → `api/eventos` → `evento.service.crear` (**Strategy**) |
| HU-12 | Moderar: rechazar con motivo | `moderacion.tsx` → `api/proyectos/[id]` → `proyecto.state.ts` (**State**) |
| HU-13 | Aprobar proyecto | `moderacion.tsx` → `api/proyectos/[id]` → `puedeAvalar` + `proyecto.state.ts` |
| HU-14 | Avisos institucionales | `aviso.repository.listarActivos` → portada (`app/page.tsx`) |
| HU-15 | Desactivar usuario | `lib/auth.ts`: un usuario con `estado = false` no puede usar la aplicación |

**Requisitos del Corte 2 (comercio)**

| Requisito | Dónde se implementa |
|---|---|
| Usuarios y seguridad (RBAC) | `lib/auth.ts` (`requiereRol`, `puedeAvalar`), roles en tabla `rol` |
| Catálogo de productos/servicios | Eventos con tipos de entrada: `evento.repository.buscarDetalle` |
| Carrito y pedido (checkout) | `compra-entradas.tsx` → `taquilla.service.comprar` → tablas `orden` y `orden_item` |
| Pasarela de pagos | `lib/integraciones/bold.ts` (Adapter) + `api/pagos/bold/webhook` |
| Confirmación y notificaciones | `taquilla.service.conciliar` → entradas + `notificacion.repository.crear` |

---

## 13. Pruebas automáticas

```bash
npx vitest run
```

| Archivo | Qué prueba |
|---|---|
| `tests/arquitectura.test.ts` | Reglas de capas: las vistas no importan el modelo y solo los repositories usan la BD |
| `tests/proyecto.state.test.ts` | Transiciones válidas e inválidas de la máquina de estados (State) |
| `tests/evento.strategy.test.ts` | Reglas por tipo de evento según el rol (Strategy) |
| `tests/proyecto.dto.test.ts` | Validación del DTO de proyectos |
| `tests/api.test.ts` | Helper de la API del navegador (respuesta `{ data, error }`) |
| `tests/unimayor-rss.test.ts` | Lectura del RSS del portal UNIMAYOR |

---

## 14. Decisiones de diseño

| Decisión | Motivo |
|---|---|
| **CSS propio** en un solo archivo, en vez de un framework | Código fácil de leer y explicar; las clases (`.tarjeta`, `.btn`, `.etiqueta`) describen lo que son. Colores tomados del portal institucional. |
| **Bold** como única pasarela | Pasarela colombiana con modo de pruebas, que acepta tarjeta, PSE, Nequi y Bancolombia en pesos colombianos. |
| **Páginas que leen el modelo directamente** y componentes que usan la API | La página actúa como controlador (pide datos al service); los formularios del navegador envían datos a `/api/*`. |
| **Sesión propia con JWT** en cookie `httpOnly` | No depende de servicios externos y no es accesible desde JavaScript del navegador. |
| **Precios en centavos** (enteros) | Evita errores de redondeo con decimales. |

---

## 15. Instalación local

Requisitos: Node.js 20+ y una base PostgreSQL (Neon).

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp .env.example .env
# Completar DATABASE_URL, DIRECT_URL, AUTH_SECRET y las llaves de Bold

# 3. Generar el cliente de Prisma
npm run db:generate

# 4. Ejecutar en desarrollo → http://localhost:3000
npm run dev
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `prisma generate` + compilación de producción |
| `npx vitest run` | Pruebas automáticas |
| `npm run lint` | ESLint |
| `npm run db:seed` | Datos de prueba (roles y usuarios con contraseña `Unimayor2026`) |

### Variables de entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` / `DIRECT_URL` | Conexión a PostgreSQL en Neon |
| `AUTH_SECRET` | Firma de la cookie de sesión |
| `BOLD_API_KEY` / `BOLD_SECRET_KEY` | Llaves de Bold (panel de Bold → Integraciones) |
| `BOLD_ENTORNO` | `pruebas` o `produccion` |
| `NEXT_PUBLIC_SITE_URL` | URL pública (a dónde vuelve el comprador desde Bold) |

---

## 16. Despliegue

- **Producción:** https://agenda-mayor.vercel.app — Vercel despliega automáticamente cada cambio en la rama `main` (`npm run build`).
- **Base de datos:** PostgreSQL en Neon.
- **Webhook de Bold:** se configura en el panel de Bold hacia `https://agenda-mayor.vercel.app/api/pagos/bold/webhook`. Si el webhook no llega, la página de resultado igual consulta el estado del pago directamente a Bold.

---

## Licencia

Proyecto académico — Institución Universitaria Colegio Mayor del Cauca.
