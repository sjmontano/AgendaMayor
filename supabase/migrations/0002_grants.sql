-- ============================================================
-- Migración 0002 — Grants para PostgREST (anon/authenticated/service_role)
-- Causa raíz: 42501 permission denied para anon en lecturas públicas
-- y PGRST201 ya corregido en código con FK explícita
-- ============================================================

-- Uso del schema
grant usage on schema public to anon, authenticated, service_role;

-- Lectura pública para anon (RLS sigue filtrando: PUBLICADO / activo=true)
grant select on table public.rol to anon, authenticated, service_role;
grant select on table public.usuario to anon, authenticated, service_role;
grant select on table public.proyecto to anon, authenticated, service_role;
grant select on table public.evento to anon, authenticated, service_role;
grant select on table public.aviso to anon, authenticated, service_role;
grant select on table public.puesto to anon, authenticated, service_role;
-- notificacion solo dueño vía RLS, pero necesita grant para que la policy evalúe
grant select on table public.notificacion to authenticated, service_role;

-- Escritura solo vía backend (service_role bypasea RLS, pero necesita grants)
grant insert, update, delete on table public.rol to service_role;
grant insert, update, delete on table public.usuario to service_role;
grant insert, update, delete on table public.proyecto to service_role;
grant insert, update, delete on table public.evento to service_role;
grant insert, update, delete on table public.aviso to service_role;
grant insert, update, delete on table public.notificacion to service_role;
grant insert, update, delete on table public.puesto to service_role;

-- Secuencias de identity (id_... generated always as identity)
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated, service_role;

-- Privilegios por defecto para futuras tablas de este rol
alter default privileges in schema public grant select on tables to anon;
alter default privileges in schema public grant select on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;
