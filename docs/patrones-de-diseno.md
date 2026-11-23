# Patrones de diseño — Agenda Mayor

Patrones identificados en el código de la solución y su justificación arquitectónica. Fuente: sección 7 del [README](../README.md).


## Patrones estructurales (GoF)

| Patrón | Ubicación | Descripción |
|---|---|---|
| **Adapter** | `lib/sesion.ts` + `lib/password.ts` + `lib/integraciones/bold.ts` | Aíslan la estrategia de sesión (JWT en cookie), el cifrado de contraseñas (bcrypt) y la pasarela de pagos (Bold) del resto del código. Los services llaman a funciones propias (`crearSesion`, `hashPassword`, `crearLinkDePago`) sin conocer la librería o API que hay detrás; cambiar el mecanismo no obliga a tocar los services. |
| **DTO** | `modelo/*/*.dto.ts` | Definen qué datos entran a cada operación y los validan con Zod antes de llegar al service (`ProyectoCreateSchema`, `EventoCreateSchema`, `CompraSchema`, `RegistroSchema`…). Las respuestas no exponen campos sensibles: `contrasena_hash` nunca sale de la API. |
| **Repository** | `modelo/*/*.repository.ts` | Abstraen el acceso a datos. Los services nunca llaman a Prisma directamente, solo al repository (verificado por test). |

## Patrones creacionales (GoF)

| Patrón | Ubicación | Descripción |
|---|---|---|
| **Singleton** | `lib/db.ts` | Una sola instancia de `PrismaClient` guardada en `globalThis`, para no abrir conexiones nuevas con cada recarga en desarrollo. |
| **Factory** | `lib/errors.ts` | Funciones `ok()`, `err()`, `badRequest()`, `unauthorized()`, `forbidden()`, `notFound()`, `conflict()` que fabrican respuestas y errores con el mismo formato `{ data, error }` en toda la API. |

## Patrones de comportamiento (GoF)

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

## Patrón arquitectónico

| Patrón | Ubicación | Descripción |
|---|---|---|
| **MVC por capas** | Todo el proyecto | Separación estricta Presentación → Modelo → Datos → Infraestructura. Verificado por test automático. |

