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
