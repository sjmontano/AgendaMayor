<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:design-workflow -->

# Design Workflow — Agenda Mayor

Fuente de diseño: `DESIGN.md` (tokens UNIMAYOR medidos + patrones de Opera Prima).
Tokens en código: `src/lib/design-tokens.ts` + `@theme` en `src/app/globals.css`.

## Reglas

- Nunca usar hex sueltos en componentes: solo tokens semánticos.
- Todo componente interactivo define: default, hover, focus-visible, active, disabled, loading y error.
- Toda superficie con fetch usa skeletons de `src/components/ui/skeleton.tsx`.
- Botones: usar `BtnMayor` (`src/components/ui/botones.tsx`).
- Accesibilidad WCAG 2.2 AA: focus visible global ya implementado; verificar axe + Lighthouse antes de entregar.
- Integración UNIMAYOR: solo server-side (`src/lib/integraciones/`), nunca desde el cliente.

<!-- END:design-workflow -->

## Herramientas (agentes)

Disco C sin espacio: **todo lo global se instala en `D:\dev\`** y se enlaza (junction) hacia `C:`.

### Skills

| Ámbito | Ubicación | Skills |
|---|---|---|
| Global Claude Code | `D:\dev\ai-skills\` → junction en `~/.claude/skills/` | `impeccable` (diseño, auditoría, animación, pulido), `ui-ux-pro-max` (79 estilos, 192 paletas, 74 pares tipográficos, 119 reglas UX), `design-expert`, `taste-design`, `design`, `design-system`, `ui-styling`, `brand`, `graphify`, `paleo-trim-context` |
| Global Claude Code | `~/.claude/skills/` | `gstack` (suite: qa, review, design-review, ship…), `codebase-memory`, `supabase` |
| Proyecto (autoskills) | `.claude/skills/` + `.agents/skills/`, lock en `skills-lock.json` | react-best-practices, composition-patterns, next-cache-components-adoption, tailwind-css-patterns, typescript-advanced-types, zod, deploy-to-vercel, nodejs-backend-patterns, nodejs-best-practices, prisma-*, vitest, frontend-design, accessibility, seo |
| Proyecto (opencode) | `.opencode/skills/` | Mismas temáticas para opencode (`opencode.json`) |

Actualizar skills del stack: `npx autoskills -y -a claude-code`.

### MCP

| Servidor | Uso |
|---|---|
| `chrome-devtools` (`--isolated`) | Ver la app en `http://localhost:3001` (dev server ya abierto por el equipo: no correr `npm run dev`), screenshots, Lighthouse, axe, medir estilos del portal unimayor.edu.co |
| `chrome-devtools-2` (`--browser-url 9222`) | Solo si hay un Chrome con `--remote-debugging-port=9222` |
| `codebase-memory-mcp` | Grafo del código: buscar símbolos, rutas, llamadas antes de grep |
| `gbrain` | Memoria persistente entre sesiones. Datos en `D:\dev\gbrain-home` (`GBRAIN_HOME`), CLI en `D:\dev\gbrain` |

### Flujo de diseño recomendado

1. Leer `DESIGN.md` (dirección creativa + tokens + formas del portal + motion).
2. Diseñar/criticar con `impeccable` o `ui-ux-pro-max`.
3. Implementar con tokens y `BtnMayor`; animaciones según `DESIGN.md` §7.
4. Verificar con `chrome-devtools` sobre `localhost:3001` (desktop + 360px, reduced-motion, Lighthouse a11y ≥ 95).
