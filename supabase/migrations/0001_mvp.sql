-- ============================================================
-- Migración MVP — Plataforma Agenda Mayor
-- Fuente de verdad: SistemaGestionProyectos_MVP.mdj
-- PostgreSQL / Supabase
-- ============================================================

-- Roles
create table if not exists rol (
  id_rol       int generated always as identity primary key,
  nombre       varchar(20) not null unique,
  descripcion  text
);

insert into rol (nombre, descripcion) values
  ('ESTUDIANTE', 'Puede crear proyectos y eventos de comunidad'),
  ('DOCENTE',    'Puede avalar proyectos de su facultad y publicar eventos EAFI'),
  ('ADMIN',      'Control total: modera, publica eventos oficiales, administra avisos');

-- Usuarios (tabla plana, sin herencia)
create table if not exists usuario (
  id_usuario   int generated always as identity primary key,
  auth_id      uuid not null unique,
  username     varchar(30) not null unique,
  nombre       varchar(50) not null,
  apellido     varchar(50) not null,
  correo       varchar(100) not null unique,
  rol          int not null references rol(id_rol),
  facultad     varchar(100),
  programa     varchar(100),
  semestre     int,
  semillero    varchar(100),
  bio          varchar(280),
  avatar       varchar(255),
  estado       boolean not null default true
);

create index idx_usuario_correo on usuario(correo);
create index idx_usuario_username on usuario(username);

-- Proyectos
create table if not exists proyecto (
  id_proyecto        int generated always as identity primary key,
  titulo             varchar(100) not null,
  descripcion        text not null,
  fotos              jsonb not null default '[]'::jsonb,
  facultad           varchar(100) not null,
  programa           varchar(100) not null,
  tipo               varchar(20) not null check (tipo in ('INSTITUCIONAL','EAFI','COMUNIDAD')),
  estado             varchar(20) not null default 'BORRADOR' check (estado in ('BORRADOR','EN_REVISION','PUBLICADO','RECHAZADO','ELIMINADO')),
  evento_origen_id   int,  -- FK a EVENTO, se agrega después de crear la tabla EVENTO
  docente_aval_id    int references usuario(id_usuario),
  motivo_rechazo     varchar(500),
  autor_id           int not null references usuario(id_usuario),
  destacado          boolean not null default false,
  fecha_registro     date not null default current_date
);

create index idx_proyecto_autor on proyecto(autor_id);
create index idx_proyecto_estado on proyecto(estado);
create index idx_proyecto_facultad on proyecto(facultad);

-- Eventos
create table if not exists evento (
  id_evento     int generated always as identity primary key,
  titulo        varchar(200) not null,
  descripcion   text not null,
  tipo          varchar(20) not null check (tipo in ('OFICIAL','EAFI','COMUNIDAD')),
  fecha_inicio  timestamp with time zone not null,
  fecha_fin     timestamp with time zone not null,
  lugar         varchar(100) not null,
  es_virtual    boolean not null default false,
  url_virtual   varchar(255),
  facultad      varchar(100),
  edicion       varchar(50),
  imagen        varchar(255),
  autor_id      int not null references usuario(id_usuario),
  activo        boolean not null default true
);

create index idx_evento_autor on evento(autor_id);
create index idx_evento_activo on evento(activo);

-- FK de PROYECTO → EVENTO
alter table proyecto
  add constraint fk_proyecto_evento_origen
  foreign key (evento_origen_id) references evento(id_evento);

-- Avisos
create table if not exists aviso (
  id_aviso  int generated always as identity primary key,
  titulo    varchar(200) not null,
  texto     text not null,
  fecha     date not null default current_date,
  activo    boolean not null default true
);

-- Notificaciones
create table if not exists notificacion (
  id_notificacion  int generated always as identity primary key,
  mensaje          text not null,
  fecha            timestamp with time zone not null default now(),
  leida            boolean not null default false,
  usuario_id       int not null references usuario(id_usuario),
  proyecto_id      int references proyecto(id_proyecto)
);

create index idx_notificacion_usuario on notificacion(usuario_id);

-- Puestos (mesas/ubicación física en ferias EAFI)
-- Cada puesto pertenece a un evento y puede ser ocupado por un proyecto
create table if not exists puesto (
  id_puesto     int generated always as identity primary key,
  codigo        varchar(20) not null unique,
  edificio      varchar(100) not null,
  piso          int not null,
  salon         varchar(100) not null,
  ubicacion     varchar(200) not null,
  estado        varchar(20) not null default 'DISPONIBLE' check (estado in ('DISPONIBLE','OCUPADO','RESERVADO')),
  evento_id     int not null references evento(id_evento),
  proyecto_id   int references proyecto(id_proyecto)
);

create index idx_puesto_estado on puesto(estado);
create index idx_puesto_evento on puesto(evento_id);

-- ============================================================
-- RLS (Row Level Security)
-- Lectura pública de contenido publicado/activo
-- Escritura solo vía service-role desde el backend (/api/*)
-- ============================================================

alter table usuario enable row level security;
alter table proyecto enable row level security;
alter table evento enable row level security;
alter table aviso enable row level security;
alter table notificacion enable row level security;
alter table puesto enable row level security;

-- Lectura pública: cualquier anónimo puede ver contenido publicado
create policy "Lectura pública de proyectos publicados"
  on proyecto for select
  using (estado = 'PUBLICADO');

create policy "Lectura pública de eventos activos"
  on evento for select
  using (activo = true);

create policy "Lectura pública de avisos activos"
  on aviso for select
  using (activo = true);

create policy "Lectura pública de usuarios activos"
  on usuario for select
  using (estado = true);

create policy "Lectura pública de puestos"
  on puesto for select
  using (true);

create policy "Lectura de notificaciones solo por su dueño"
  on notificacion for select
  using (auth.uid() = (select auth_id from usuario where id_usuario = usuario_id));

-- Escritura: todo por service-role (backend), no por anon
-- No se crean policies de INSERT/UPDATE/DELETE para anon
-- El backend usa service-role key que bypasea RLS
