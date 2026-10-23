# DESIGN.md — Agenda Mayor

> Intención en una frase: que Agenda Mayor **se sienta una extensión del portal UNIMAYOR** (misma tipografía, mismos azules, isologo del Claustro) pero con mejor ejecución: más rápida, accesible y consistente.

## Dirección creativa (decisión del equipo, 2026-10-23)

Agenda Mayor es una **subpágina de https://www.unimayor.edu.co/**. Hereda su imagen corporativa, pero **no** su ejecución visual (al equipo no le gusta estilísticamente el portal).

| Restricción (no negociable) | Libertad creativa (se espera que sea mucho mejor) |
|---|---|
| Colores institucionales medidos (§1.2) | Composición, ritmo, jerarquía y espaciado |
| Forma de las cajas del portal (§1.4): cajas azules con borde, cards de noticia con imagen + tag + título, barra dorada de título | Cómo se animan, se apilan, reaccionan al hover/scroll y se estilizan |
| Tipografía Nunito Sans | Escala, tracking, contraste de pesos |
| Footer institucional (contenido y datos legales) | Su diseño, que puede ser más limpio y moderno |

Regla práctica: **mismas cajas y colores, mejor hechas**. Si alguien pone el portal y Agenda Mayor lado a lado, debe reconocer la misma institución y notar que la nuestra está más pulida, más fluida y mejor animada. Copiar el portal píxel a píxel es un anti-patrón (§5).

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

Implementados en `@theme` (`globals.css`) y `src/lib/design-tokens.ts` (2026-10-23).

| Token | Hex | Uso |
|---|---|---|
| `unimayor-950` | `#082e45` | Fondos profundos: franja superior, footer, overlays (medido) |
| `unimayor-900` | `#004884` | Títulos, CTA primario, focus (medido) |
| `unimayor-800` | `#003b73` | Hover de CTA primario (medido) |
| `unimayor-700` | `#195a90` | Enlaces, eyebrows (medido; fondo del footer del portal) |
| `unimayor-600` | `#19589f` | Bordes institucionales |
| `unimayor-nav` | `#3366cc` | Franja GOV.CO, brillos de fondo (medido) |
| `unimayor-100` | `#e6eef6` | Superficies suaves, hover de ítems |
| `unimayor-tint` | `#f8fbfd` | Fondos alternos de sección |
| `gold` / `gold-hover` | `#f2a900` / `#ffab00` | Acento: barra de títulos, CTA "Publicar", indicadores, hover sobre azul (medido) |
| `gold-ink` / `gold-soft` | `#6b4a00` / `#fff6dc` | Avisos y chips dorados (texto oscuro sobre fondo suave) |
| `ink` | `#333030` | Texto primario (medido) |
| `muted` | `#52677a` | Texto secundario (medido, 5.6:1 sobre blanco) |
| `line` / `line-soft` | `#e4e4e7` / `#eef1f5` | Bordes, separadores, rieles |
| `success` / `success-soft` | `#15803d` / `#e8f6ee` | PUBLICADO, aprobar |
| `warning` / `warning-soft` | `#b45309` / `#fef3c7` | EN_REVISION |
| `error` / `error-soft` | `#b91c1c` / `#fdecec` | RECHAZADO, errores |

- `success` y `error` se oscurecieron (antes `#16a34a` / `#dc2626`) para pasar 4.5:1 sobre sus fondos suaves (axe, 2026-10-23).
- El dorado nunca es texto sobre blanco (1.96:1). Sobre azul sí: es el anillo de foco en zonas `.on-dark`.
- Gráficos: la paleta de marca **no** sirve como categórica de 4+ series (falla el validador de dataviz). Usar un solo tono `unimayor-900` y etiquetas directas.

En código: `src/lib/design-tokens.ts` + `@theme` en `globals.css`. **Must**: ningún componente usa hex sueltos.

### 1.3 Espaciado, radios, sombras, motion

- Espaciado: escala 4/8/12/16/24/32/48/64. Contenedor `mx-auto max-w-6xl px-4 sm:px-6`. Secciones `py-20 lg:py-24`.
- Radios: `rounded-box` 12px (la caja del portal: botones, inputs, cajas) · `rounded-tile` 20px (cards y tiles del bento) · `rounded-full` (badges, pills).
- Sombras: **elevación suave con tinte institucional**, no offset. `shadow-soft` (reposo), `shadow-lift` (hover: la card sube con `-translate-y-1`), `shadow-pop` (popovers, modales, toasts). Las sombras desplazadas de Opera Prima quedaron descartadas: se leían duras frente al portal.
- Texturas: `.bg-grid-dark` / `.bg-grid-light` (rejilla de 48/40px) y brillos difusos `unimayor-nav` en fondos azules.
- Motion: ver §7. Las entradas que deben verse sin JS (hero, títulos LCP) usan `.reveal .reveal-1..4` en CSS; el resto usa `motion`.

### 1.4 Formas del portal (las "cajas" que se conservan)

Medidas en el HTML de unimayor.edu.co. Se conserva la **anatomía**; la ejecución se mejora.

| Caja del portal | Anatomía real | Nuestra versión mejorada |
|---|---|---|
| `user-card` (accesos por perfil: Aspirantes, Estudiantes…) | Píldora-caja `#004884`, radio 12px, borde 1px blanco 85%, icono + divisor vertical blanco 65% + texto 600/700 | Misma caja; hover con elevación suave, brillo en borde, icono que se desplaza; entrada escalonada |
| `um3-card` (noticias) | Media arriba + tag + título; variante con overlay de título sobre imagen | Card de proyecto/evento: imagen con zoom lento en hover, tag tipo badge, overlay degradado `unimayor-deep` |
| `um-video-card` | Icono + título + meta + flecha | Card de enlace/recurso: flecha que avanza en hover |
| `um-title__bar` | Barra dorada 4×28px a la izquierda del título | Título de sección con barra dorada que crece al entrar en viewport |
| Footer + `barra-govco` | Fondo azul, logo blanco, horario, contacto, notificaciones judiciales, redes, franja GOV.CO | Mismos datos, layout en columnas más aireado, enlaces con hover dorado |

## 2. Reglas por componente

### 2.1 Layout global

(1) **Franja** `unimayor-950`: GOV.CO, Transparencia, Atención al ciudadano y Portal UNIMAYOR. (2) **Navbar** blanca sticky: isologo + "Agenda Mayor", navegación en píldora con indicador activo que se desliza (`layoutId`) y, a la derecha, "Publicar" (dorado), la campana y el menú de usuario. Sin sesión muestra "Ingresar" y "Crear cuenta". Al hacer scroll se compacta (de 80 a 64px) con blur y sombra. Por debajo de 1024px el menú pasa a un `Drawer` (arrastrar para cerrar, Escape, foco atrapado). (3) **Footer** `unimayor-950` con rejilla, filete dorado y los datos reales del portal (contacto, correo, notificaciones judiciales, horario, redes, línea anticorrupción, SNIES/NIT), más la franja GOV.CO `unimayor-nav`. Incluye enlace "Saltar al contenido".

### 2.2 Rutas y pantallas

| Ruta | Contenido |
|---|---|
| `/` | Hero con buscador y **pila de destacados** (tarjetas en abanico; clic trae una al frente; rota cada 5s) → accesos por perfil (`user-card`) → cifras con `CountUp` + actividad de 30 días + barras por facultad → proceso (estados reales) → facultades → recientes → eventos → avisos → CTA |
| `/proyectos` | Vitrina: búsqueda con espera de 350ms, tipo segmentado, chips de facultad y de filtros activos, paginación numerada. Todo vive en la URL |
| `/proyectos/[id]` | Hero con la portada difuminada, galería con visor (flechas y Escape), ficha del autor, compartir, "Dónde verlo" (puesto EAFI) y relacionados. El autor y los moderadores ven la vista previa en otros estados |
| `/proyectos/nuevo` | Asistente en 4 pasos (Información → Académico → Imágenes → Revisión), vista previa en vivo, borrador en `localStorage` y celebración al enviar |
| `/eventos` | Pestañas Oficiales / EAFI / Comunidad / Portal (RSS en vivo) |
| `/perfil/[username]` | Hero del perfil + tiles + proyectos publicados |
| `/panel` | Bento por rol. **Estudiante**: saludo, barra de estados, publicar, mis proyectos con seguimiento y "Ajustar y reenviar". **Docente/Admin**: proyectos por revisar, medidor de aprobación, cola de revisión (aprobar / pedir ajustes con motivo y sugerencias) y actividad. **Admin**: además barras por facultad, importación del RSS y puestos EAFI. `/admin` redirige aquí |
| `/notificaciones` | Agrupadas en Hoy / Ayer / Esta semana / Anteriores, con filtros y "marcar todas" |
| `/ingresar`, `/registro` | Pantalla dividida con panel de marca. Registro en 2 pasos con medidor de contraseña y usuario sugerido a partir del correo |

Las rutas privadas se protegen en `src/proxy.ts` (cookie) y se verifican de nuevo en la página y en la API.

### 2.3 Botones (`BtnMayor` / `BtnIcono` en `src/components/ui/botones.tsx`)

Variantes `primary / secondary / ghost / gold / onDark / onDarkGhost / danger / success` × tamaños `sm / md / lg`. Con `href` se convierte en enlace. Admite `icono` animado (`inicio` o `fin`), `cargando` (spinner + `aria-busy`) y `anchoCompleto`. Texto en caja normal y peso 700 (se descartó el uppercase con tracking).
Estados: hover (sube y aumenta la sombra; brillo que cruza en primary/gold/onDark), focus-visible global, active `scale-0.97`, disabled al 50%. Área táctil de 44px en md (`BtnIcono` 44×44).

### 2.4 Iconos animados

lucide-animated (registro de 21st.dev, basado en `motion`) en `src/components/icons/`. Para añadir uno: `https://lucide-animated.com/r/<nombre>.json` → `files[0].content`. Con `useIcono()` (`src/components/ui/icono.tsx`) la animación se dispara al **pasar el cursor por el contenedor**, no solo por el SVG. El foco no la dispara: el foco programático de los diálogos la interrumpía y dejaba el icono invisible.

### 2.5 Cards

`ProyectoCard`: portada 16/10 (zoom lento al hover; si no hay foto o la carga falla, degradado institucional con la inicial y la facultad), badges de tipo y estado, programa, título (2 líneas), resumen, autor con avatar y flecha. Toda la card es un enlace (stretched link). `EventoCard`: chip de fecha tipo calendario, tipo y lugar; la variante RSS enlaza al portal.

### 2.6 Estados vacíos, de carga y de error

`Vacio` (rejilla clara + icono + acción), skeletons con shimmer (`.skeleton`, `SkeletonGrid/Lista/Bento/Hero`, `Cargando` para lectores de pantalla), `ErrorVista` con reintento y 404 institucional. Los toasts (`useToast`) confirman las acciones.

### 2.7 Badges de estado

`BadgeEstado` = punto + texto + color (nunca solo color). EN_REVISION pulsa. Es la cara visible de `proyecto.state.ts`.

### 2.8 Inputs (`Campo`, `CampoArea`, `CampoSelect`, `CampoClave` en `src/components/ui/campo.tsx`)

Label siempre visible; ayuda y error enlazados con `aria-describedby`; `aria-invalid`; error animado; contador de caracteres; mostrar/ocultar contraseña y medidor de fortaleza. Focus: borde `unimayor-900` + halo de 4px. Se valida al salir del campo.

## 3. Accesibilidad (WCAG 2.2 AA — testable)

- **Must**: focus visible global (implementado); contraste texto ≥ 4.5:1 (verificar con Lighthouse/axe por página).
- **Must**: navegación completa por teclado incl. menú móvil y galerías (flechas en galería, Escape en diálogos).
- **Must**: imágenes con `alt` descriptivo; skeletons con `aria-hidden` + región `aria-busy`/`aria-live` en la campana.
- Pass/fail: `axe` sin violaciones críticas + Lighthouse accesibilidad ≥ 95 antes de cada entrega.
- Verificado el 2026-10-23: axe (WCAG 2.2 AA) sin violaciones en `/`, `/proyectos`, `/eventos`, `/ingresar`, `/registro` y la 404, y sin scroll horizontal a 360px. Los elementos de menos de 24px (barras de actividad) no son interactivos; sus datos están en una tabla `sr-only`.

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

## 7. Sistema de animación (motion)

Librería: **`motion`** 14 (`motion/react`), instalada junto a `lucide-react`, `clsx` y `tailwind-merge` (helper `cn` en `src/lib/utils.ts`). `MotionConfig reducedMotion="user"` en `src/components/providers.tsx`.

Implementado: `Reveal` (TimelineAnimation adaptado), `Drawer` (MotionDrawer adaptado), `Modal`, `Pills` (indicador con `layoutId`), `CountUp`, `EncabezadoSeccion` (barra dorada que crece), `PilaDestacados`, `Actividad`, `BarrasFacultad` y `Medidor` (patrones del ejemplo Web3Bento), toasts y transiciones del asistente. Las animaciones CSS simples (`.reveal`, hover) siguen en CSS; `motion` se usa para secuencias, gestos y presencia (montar/desmontar).

Componentes de referencia (código y ajustes en `docs/design/motion-referencias.md`):

| Componente | Uso en Agenda Mayor |
|---|---|
| `MotionDrawer` | Menú móvil del navbar (< 1024px) y filtros de la vitrina en móvil. Drag para cerrar |
| `TimelineAnimation` | Reveal secuencial con blur al entrar en viewport: hero, títulos de sección, grids, timeline de estados del proyecto |
| ReUI (21st.dev, https://21st.dev/@sean0205/library/reui) | Catálogo de componentes shadcn-compatibles para tomar patrones (tabs, accordions, steppers, cards animadas) |

Reglas **must**:
- Tokens, no hex: los componentes de referencia traen `#ffffff` / `rgba(...)`; se reemplazan por tokens.
- `useReducedMotion()` en todo componente con `motion`: sin desplazamiento ni blur, solo opacidad o estado final directo.
- Stagger de grids `~80ms` por ítem (máx. ~400ms acumulado). Blur de entrada ≤ 8px. Duraciones 200–500ms; springs `damping ≥ 20` (sin rebote exagerado).
- Animar solo `transform`, `opacity` y `filter`; nunca `width/height/top/left`.
- `'use client'` solo en hojas animadas; páginas y layouts siguen siendo Server Components.
- El contenido LCP (título del hero) no depende de JS para ser visible.
- Drawers y modales: `role="dialog"`, `aria-modal`, focus trap, Escape, retorno de foco; botones de icono con `aria-label`.

Microinteracciones esperadas: cards que se elevan con sombra offset `unimayor-900`, imagen con zoom lento, flechas que avanzan, barra dorada que crece en títulos, contadores del hero que suben al entrar, badges de estado con transición de color.

## 8. Herramientas de diseño para agentes

Detalle en `AGENTS.md` (§Herramientas). Resumen: skills `impeccable`, `ui-ux-pro-max`, `design-expert`, `taste-design`, `design-system`, `ui-styling`, `brand`, `frontend-design`, `accessibility`; MCP `chrome-devtools` para verificar visualmente sobre `http://localhost:3001` y medir el portal real.

## 9. QA checklist

- [ ] Cero hex fuera de `design-tokens.ts` / `@theme`.
- [ ] Cada superficie con fetch tiene skeleton o loader.
- [ ] Tab recorre todo; focus visible en cada parada; Escape cierra menús/diálogos.
- [ ] axe sin violaciones críticas; Lighthouse accesibilidad ≥ 95; LCP home < 1.5s.
- [ ] Hero legible a 360px sin scroll horizontal; imágenes con `alt`.
- [ ] RSS importa sin duplicados (`total/creados/omitidos` en la respuesta).
- [ ] Cada animación respeta `prefers-reduced-motion` (probar con DevTools → Rendering → emulate).
- [ ] Comparación lado a lado con unimayor.edu.co: misma marca reconocible, ejecución claramente superior.
