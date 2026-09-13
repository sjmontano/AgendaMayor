# DESIGN.md — Agenda Mayor

> Intención en una frase: que Agenda Mayor **se sienta una extensión del portal UNIMAYOR** (misma tipografía, mismos azules, isologo del Claustro) pero con mejor ejecución: más rápida, accesible y consistente.

## 0. Assets de marca (`public/brand/`)

| Archivo | Uso |
|---|---|
| `logoPrincipal.jpg` | Isologo del Claustro (sin letras): navbar junto a "Agenda Mayor", hero, favicon (`src/app/icon.jpg`) |
| `logo_blanco.png` | Logo institucional blanco (fondo transparente): footer sobre `#004884` |
| `escudo-unimayor.png`, `logo-oficial.png`, `favicon-unimayor.png` | Reserva: versiones del portal, no usadas en la UI actual |

- Producto: Agenda Mayor — vitrina de proyectos, cartelera de eventos y perfiles UNIMAYOR.
- Referencia visual: https://www.unimayor.edu.co/ (Joomla, medida con DevTools el 2026-09-12).
- Patrones de interacción: Opera Prima (`src/app/diseno`, `Skeleton.tsx`, `design-tokens.ts`, motion).
- Audiencia: estudiantes, docentes y visitantes (público general, mobile-first).

## 1. Tokens y fundaciones

### 1.1 Tipografía (usar la de UNIMAYOR, sin inventar)

- Primaria: **Nunito Sans** (Google Fonts, pesos 400/600/700/800/900, `display=swap`). Medida real del portal: `"Nunito Sans", system-ui, sans-serif`, base 16px/400.
- Jerarquía por peso, no por familias: H = 800, eyebrow/label = 700 + tracking, cuerpo = 400/600.
- Escala (clamp fluido, patrón Opera Prima):

| Token | Clase |
|---|---|
| display | `text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em]` |
| h1 | `text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-[1.1]` |
| h2 | `text-[clamp(1.35rem,2.4vw,1.9rem)] font-bold leading-[1.2]` (portal real: 27.2px/700/#004884) |
| h3 | `text-xl font-bold leading-[1.3]` |
| body-lg | `text-[1.0625rem] leading-[1.7]` |
| body-md | `text-[0.9375rem] leading-[1.65]` |
| eyebrow | `text-xs font-bold tracking-[0.2em] uppercase text-[#195a90]` |

### 1.2 Color (tokens semánticos — must)

| Token | Hex | Uso |
|---|---|---|
| `unimayor-900` | `#004884` | Títulos, CTA primario, focus |
| `unimayor-700` | `#195a90` | Enlaces, eyebrows |
| `unimayor-600` | `#19589f` | Bordes institucionales |
| `unimayor-nav` | `#3366cc` | Fondo navbar principal (medido) |
| `unimayor-tint` | `#f8fbfd` | Fondos alternos |
| `ink` | `#333030` | Texto primario (medido) |
| `surface` | `#ffffff` | Fondo base (medido) |
| `line` | `#e4e4e7` | Bordes, separadores |
| `error` / `success` | `#dc2626` / `#16a34a` | Estados |

En código: `src/lib/design-tokens.ts` + `@theme` en `globals.css`. **Must**: ningún componente usa hex sueltos.

### 1.3 Espaciado, radios, sombras, motion

- Espaciado: escala 4/8/12/16/24/32/48/64 (patrón Opera Prima). Secciones: `px-6 py-16 lg:py-24`, ancho `max-w-6xl`.
- Radios: cards/inputs `10px`, badges/píldoras `9999px`.
- Sombras: estilo offset institucional (patrón Opera Prima adaptado) — card hover `6px 6px 0 #004884`, botón primario `4px 4px 0 #333030`, active = press (`translate + shadow-none`).
- Motion: `fast 150ms / base 200ms / slow 300ms`, easing `cubic-bezier(0.2,0,0,1)`; reveal `fade-up 400ms` + stagger `.reveal-1..4`; skeletons `animate-pulse` (o `animate-shimmer` sobre azul). **Must**: respetar `prefers-reduced-motion` (ya implementado en `globals.css`).

## 2. Reglas por componente

### 2.1 Navbar (extensión del portal, no copia)

Anatomía de arriba a abajo: (1) franja institucional delgada (`#004884`, enlaces Gobierno/Transparencia — como el portal); (2) barra blanca con **isologo del Claustro** (`/brand/logoPrincipal.jpg`) + título "Agenda Mayor" + secciones; (3) barra azul `unimayor-nav` con secciones: Inicio · Proyectos · Eventos · Perfiles + botón "Publicar" (variante sobre azul) + avatar/sesión.

- Sticky, colapsa a hamburguesa < 1024px (el portal usa DJ-MegaMenu; nosotros menú simple + panel).
- Teclado: Tab recorre, Enter/Espacio abren submenús, Escape cierra, focus siempre visible.
- Edge: sin sesión muestra "Ingresar"; con sesión muestra avatar + campana de notificaciones (HU-10).

### 2.2 Hero (cómo se hacen)

Patrón portal: slideshow institucional a ancho completo. Nuestra versión mejorada: fondo `unimayor-900` con imagen a la derecha (rounded, borde `unimayor-600`), a la izquierda eyebrow ("Vitrina UNIMAYOR"), display con el conteo ("120+ proyectos · 4 facultades"), sub en blanco/80 y dos CTAs (primario blanco-sobre-azul + secundario fantasma). Reveal escalonado al cargar. Versión por facultad: mismo hero cambiando eyebrow y acento. **Must**: texto alternativo en la imagen y contraste blanco-sobre-`#004884` ≥ 7:1.

### 2.3 Botones (`BtnMayor` en `src/components/ui/botones.tsx`)

Variantes `primary / secondary / ghost` × tamaños `sm / md / lg`. Texto siempre en mayúsculas con `tracking-widest` (patrón Opera Prima).
Estados **must**: default, hover (desplaza `-0.5` + sombra offset), focus-visible (global 3px `#004884`), active (press: vuelve a su sitio, sin sombra), disabled (zinc, `cursor-not-allowed`), loading (`LoadingButton` con spinner + `disabled`).
Táctil: área mínima 44px.

### 2.4 Cards (noticias → proyectos/eventos)

Anatomía: imagen 16/10 con lazy loading → badge facultad/tipo → título (h3, 2 líneas máx con ellipsis) → meta (autor · fecha) → footer con enlace "Ver proyecto →".
Hover (desktop): levanta `-1` + sombra offset `#004884`. Card de evento suma bloque fecha/lugar y chip `OFICIAL/EAFI/COMUNIDAD` (`badge.*` en tokens).
Vacíos: "No se encontraron proyectos con estos filtros" + botón limpiar filtros. Error: card de reintento, nunca pantalla en blanco.

### 2.5 Skeletons y loaders (`src/components/ui/skeleton.tsx`)

`SkeletonHero` (encabezado azul), `SkeletonGrid` (vitrina, 6), `SkeletonText`, `SkeletonBadge`, `LoadingButton`. **Must**: usarse en cada superficie con fetch (vitrina, detalle, perfil); incluir `aria-hidden` + texto de carga para lector de pantalla.

### 2.6 Badges de estado (trazan al State del backend)

`PUBLICADO` verde, `EN_REVISION` ámbar, `RECHAZADO` rojo, más `facultad` y `tipo`. El badge es la cara visible de `proyecto.state.ts`.

### 2.7 Inputs

Borde 2px `line`, focus `unimayor-900` + sombra offset, error rojo + mensaje asociado por `aria-describedby`. Labels siempre visibles (nunca solo placeholder).

## 3. Accesibilidad (WCAG 2.2 AA — testable)

- **Must**: focus visible global (implementado); contraste texto ≥ 4.5:1 (verificar con Lighthouse/axe por página).
- **Must**: navegación completa por teclado incl. menú móvil y galerías (flechas en galería, Escape en diálogos).
- **Must**: imágenes con `alt` descriptivo; skeletons con `aria-hidden` + región `aria-busy`/`aria-live` en la campana.
- Pass/fail: `axe` sin violaciones críticas + Lighthouse accesibilidad ≥ 95 antes de cada entrega.

## 4. Contenido y tono

Conciso, institucional, en español. Eyebrows en mayúsculas ("Vitrina · Facultad de Ingeniería"). CTAs con verbo: "Publicar proyecto", "Ver evento", "Enviar a revisión". Vacíos útiles ("Aún no hay proyectos EAFI en esta facultad — publica el primero"). **Don't**: jerga interna ("EAFI" siempre con tooltip la primera vez), mayúsculas sostenidas en párrafos, texto gris claro sobre blanco.

## 5. Anti-patrones prohibidos

- Copiar el portal tal cual (menús Joomla, sliders pesados, imágenes sin optimizar).
- Hex fuera de tokens; radios/sombras inventadas por componente.
- Botones `<div>` clicables; focus oculto; skeletons sin `aria-hidden`.
- Cargar galerías completas sin lazy loading (RNF HU-08: transferencia inicial < 500KB).
- Consumir el RSS de UNIMAYOR desde el cliente (va en servidor con caché 1h — ver §6).

## 6. Integración UNIMAYOR (eventos del portal en nuestra cartelera)

El portal **no expone API JSON** (Joomla server-rendered, verificado: cero XHR/fetch propios). Fuente oficial disponible: **RSS de Eventos** (`.../category/9-eventos?...&format=feed&type=rss`) con título, descripción HTML (imagen + Fecha + Lugar), fecha de publicación y enlace.

- Módulo: `src/lib/integraciones/unimayor-rss.ts` (fetch server-side, caché 1h, normaliza a `EventoExterno`).
- Importación: `POST /api/admin/importar-eventos` (solo ADMIN, idempotente por título) → crea `EVENTO tipo=OFICIAL`, `lugar` extraído del HTML o "UNIMAYOR", fuente citada en la descripción.
- Límite honesto: fecha exacta del evento viene en texto libre ("9, 10 y 11 de septiembre"), así que `fecha_inicio` usa la fecha de publicación y el detalle remite al enlace original.

## 7. QA checklist

- [ ] Cero hex fuera de `design-tokens.ts` / `@theme`.
- [ ] Cada superficie con fetch tiene skeleton o loader.
- [ ] Tab recorre todo; focus visible en cada parada; Escape cierra menús/diálogos.
- [ ] axe sin violaciones críticas; Lighthouse accesibilidad ≥ 95; LCP home < 1.5s.
- [ ] Hero legible a 360px sin scroll horizontal; imágenes con `alt`.
- [ ] RSS importa sin duplicados (`total/creados/omitidos` en la respuesta).
